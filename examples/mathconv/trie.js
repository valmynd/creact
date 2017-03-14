const VALUE_KEY = "_v"
const GROUP_KEY = "_g" // there could be multiple groups at one point in the trie
const ESCAPED_BACKSLASH_REPLACEMENT = "\u0003"
const quantifiers = new Set(["*", "+", "?"])
const escapable = new Set(["(", "{", "[", "|"])
const brackets = new Set(["(", "{", "["])
const r = String.raw

/**
 * idea for operator precedence:
 * - we have arrays for the keyword _g at various positions in the trie
 * - e.g. we may have a rule Expression: {Literal}|{Multiplication}|{Addition}{Subtraction}
 *    - Multiplication could be defined as {left:Expression}{WS}*{operator:OP}{WS}*{right:Expression}
 *    - we end up having something like known["Expression"] = {"_g": [...]}
 * - all we need to do is sort that array by the binding power of each!
 */

/**
 * @typedef {Object} GroupInfo
 * @property {string|Group} group
 * @property {function} [nud] (handler of a token as prefix)
 * @property {function} [led] (handler of a token as infix)
 */


class _Trie {
  constructor(root = this) {
    this.trie = {}
    this.root = root
    this.value_nodes = new Set()
    this.group_nodes = new Set()
    this.labeled = []
  }

  _parse_ranges(str, next) {
    // assume single-characters for now, \u0000 etc. later! NO [^...]-support
    // \u0000 etc can be handled as such: http://stackoverflow.com/questions/7885096/
    if (/^-|-.?-|-$/.test(str)) throw new Error(`InvalidRangeSyntax: ${str}`)
    let obj = {}, to, from
    for (let i = 0, len = str.length; i < len; i++) {
      if (str[i + 1] === "-") {
        from = str.charCodeAt(i++)
        to = str.charCodeAt(++i)
        if (from > to) throw new Error(`InvalidRange: ${String.fromCharCode(from)} > ${String.fromCharCode(to)}`)
        for (let c = from; c <= to; c++) {
          obj[String.fromCharCode(c)] = next
        }
      }
      else obj[str[i]] = next
    }
    return obj
  }

  _parse_group(str, next, repeatable) {
    let group = new Group(this.root, str)
    return {group, next, repeatable}
  }

  _parse_named_group(str, next, repeatable) {
    let group, target, s = str.split(":")
    if (s.length === 1) {
      group = s[0] // only strings for now, as it could be a circular definition
      return {group, next, repeatable}
    } else {
      group = s[1]
      target = s[0]
      this.labeled.push(group)
      return {group, target, next, repeatable}
    }
  }

  _insert(key) {
    let k, quantifier, optional, repeatable, current = this.trie
    let value_nodes = this.value_nodes, group_nodes = this.group_nodes
    for (let i = 0, len = key.length; i < len; i++) {
      k = key[i]
      quantifier = null
      optional = false
      repeatable = false
      // if an unescaped ( is found, handle it as a group until )
      if (brackets.has(key[i]) && key[i - 1] !== "\\") { // \( or \{ or \[
        let s = key.substr(i), group_info, obj, next = {}
        let c = (k === "(") ? s.search(/[^\\]\)/) : (k === "{") ? s.search(/[^\\]\}/) : s.search(/[^\\]\]/)
        if (c === -1) throw new Error(`UnclosedBracketInRegularExpression: ${s}`)
        let p = s.substr(1, c), q = s[c + 2], qb = s[c + 1]
        if (quantifiers.has(q) && qb !== "\\") {
          quantifier = q
          optional = (quantifier !== "+")
          repeatable = (quantifier !== "?")
          i++
        }
        if (k === "[") {
          obj = this._parse_ranges(p, next)
          Object.assign(current, obj)
          if (repeatable) Object.assign(next, obj)
          value_nodes.forEach(node => Object.assign(node, obj))
        } else {
          if (k === "(") group_info = this._parse_group(p, next, repeatable)
          else group_info = this._parse_named_group(p, next, key, repeatable)
          if (GROUP_KEY in current) current[GROUP_KEY].add(group_info)
          else current[GROUP_KEY] = new Set([group_info])
          group_nodes.add(current)
          value_nodes.forEach(node => {
            let tmp = node[GROUP_KEY]
            if (tmp === undefined) {
              node[GROUP_KEY] = new Set([group_info])
              group_nodes.add(node)
            } else if (tmp !== current) {
              tmp.add(group_info)
            }
          })
        }
        current = next
        if (!optional) value_nodes.clear()
        value_nodes.add(current)
        i += ++c
      } else {
        // handle backslashes
        if (k === ESCAPED_BACKSLASH_REPLACEMENT) { // double-backslash was replaced above
          k = "\\"
        } else if (k === "\\") {  // only allow escaping where it makes sense
          if (escapable.has(key[i + 1])) k = key[++i]
          else throw new Error(`UnnecessaryEscapeInRegularExpression: ${key.substr(i)}`)
        }
        // if an unescaped | is found, leave the rest of the key to a subsequent insert()-call
        else if (k === "|" && key[i - 1] !== "\\") {
          if (i === 0) throw new Error(`TautologyInRegularExpression: ${key}`)
          if (key[i - 1] !== "\\") { // \|
            this._insert(key.substr(i + 1))
            break
          }
        }
        // detect unescaped quantifiers, e.g. inf+i?n?i?ty
        else if (quantifiers.has(key[i + 1])) { // *+?
          quantifier = key[i + 1]
          optional = (quantifier !== "+")
          repeatable = (quantifier !== "?")
        }
        // advance previous and current
        current = current[k] || (current[k] = {})
        value_nodes.forEach(node => {
          let tmp = node[k]
          if (tmp === undefined) node[k] = current
          else if (tmp !== current) Object.assign(tmp, current)
        })
        // handle quantifiers
        if (!optional) value_nodes.clear()
        value_nodes.add(current)
        if (repeatable) current[k] = current
        if (quantifier !== null) i++
      }
    }
  }
}

export class Trie extends _Trie {
  constructor() {
    super()
    this.known = {}
  }

  /**
   * Add a named Group
   * Returns a list of labeled sub-groups
   * @example
   *  trie.define("FLOAT", r`[0-9]+(.[0-9]+)?`)
   *  trie.insert("a{FLOAT}", 1)
   *  trie.match("a4.2")
   * @param {string} identifier
   * @param {string} pattern
   * @returns {Group[]}
   */
  define(identifier, pattern) {
    let group = new Group(this, pattern)
    this.known[identifier] = group
    return group.labeled
  }

  /**
   * define Binary Left-Associative Operator
   * @param {int} priority
   * @param {string} identifier
   * @param {string} pattern
   */
  defineBinaryLeftAssociative(priority, identifier, pattern) {
    let labeled_groups = this.define(identifier, pattern)
    if (labeled_groups.length !== 3) throw new Error(`InvalidBinaryOperator: ${pattern}`)
    let [left, op, right] = labeled_groups
    //op.priority = priority
  }

  /**
   * define Binary Right-Associative Operator
   * @param {int} priority
   * @param {string} identifier
   * @param {string} pattern
   */
  defineBinaryRightAssociative(priority, identifier, pattern) {
    let labeled_groups = this.define(identifier, pattern)
    if (labeled_groups.length !== 3) throw new Error(`InvalidBinaryOperator: ${pattern}`)
    let [left, op, right] = labeled_groups
    //op.priority = priority
  }

  /**
   * define Unary Prefix Operator
   * @param {int} priority
   * @param {string} identifier
   * @param {string} pattern
   */
  defineUnaryPrefix(priority, identifier, pattern) {
    let labeled_groups = this.define(identifier, pattern)
    if (labeled_groups.length !== 2) throw new Error(`InvalidUnaryOperator: ${pattern}`)
    let [op, right] = labeled_groups
    //op.priority = priority
  }

  /**
   * define Unary Postfix Operator
   * @param {int} priority
   * @param {string} identifier
   * @param {string} pattern
   */
  defineUnaryPostfix(priority, identifier, pattern) {
    let labeled_groups = this.define(identifier, pattern)
    if (labeled_groups.length !== 2) throw new Error(`InvalidUnaryOperator: ${pattern}`)
    let [left, op] = labeled_groups
    //op.priority = priority
  }

  _merge_groups(group_nodes) {
    // merge group-nodes with the trie
    for (let node of group_nodes) {
      for (let {group, next, repeatable} of node[GROUP_KEY]) {
        if (typeof group === "string") group = this.known[group]
        Object.assign(node, group.trie)
        if (repeatable) Object.assign(next, group.trie)
        group.value_nodes.forEach(vn => {
          Object.assign(vn, next)
        })
        this._merge_groups(group.group_nodes)
      }
      delete node[GROUP_KEY]
    }
  }

  /**
   * Insert key-value-pair into the Trie
   * Keys can contain very(!) simple forms of regular expressions, e.g.
   *  "oo|inf(inity)?"
   *  "-=|eq(u)?(iv|als)?"
   * @param {string} key
   * @param {*} value
   */
  insert(key, value) {
    this._insert(key.replace(/\\\\/, ESCAPED_BACKSLASH_REPLACEMENT))
    // assign value to nodes that should cause a match
    for (let node of this.value_nodes) {
      if (!(VALUE_KEY in node)) node[VALUE_KEY] = value
    }
    this._merge_groups(this.group_nodes)
  }

  /**
   * Returns Value and matching string of the best matching Entry in the Trie, or null if no match
   * @param {string} str
   * @returns {{match: string, value: *}|null}
   */
  match(str) {
    let n, v, i = 0, current = this.trie
    let last_value = null, last_value_i = 0
    for (let len = str.length; i < len; i++) {
      n = current[str[i]]
      if (n === undefined) break
      // keep track of last value
      v = n[VALUE_KEY]
      if (v !== undefined) {
        last_value = v
        last_value_i = i
      }
      // advance
      current = n
    }
    if (last_value === null) return null
    return {match: str.substr(0, last_value_i + 1), value: last_value}
  }
}

class Group extends _Trie {
  constructor(root, pattern) {
    super(root)
    this._insert(pattern)
  }

  setupOperator(bp = 0, nud = null, led = null, expect_left = null, expect_right = null) {
    if (bp > this.bp) this.bp = bp
    if (nud !== null) {
      if (this.nud === null) this.nud = nud
      else throw "AlreadyDefinedNud"
    }
    if (led !== null) {
      if (this.led === null) this.led = led
      else throw "AlreadyDefinedLed"
    }
  }
}
