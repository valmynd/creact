const VALUE_KEY = "_v"
const GROUP_KEY = "_g" // there could be multiple groups at one point in the trie
const VALUE_PLACEHOLDER = -1
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


export class Trie {
  constructor(root = null) {
    this.trie = {}
    this.root = root
    this.labeled = []
    if (root === null) { // not instanceOf Group
      this.root = this
      this.known = {}
    }
  }

  _type() {
    // return (this instanceof Group) ? "group" : "trie"
    return (this === this.root) ? "trie" : "group"
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

  _parse_group(str, next) {
    let group = new Group(str, this.root)
    return {group, next}
  }

  _parse_named_group(str, next) {
    let group, target, known = this.root.known, s = str.split(":")
    if (s.length === 1) {
      group = s[0] // only strings for now, could be circular definition, replaced ad-hoc in match()
      return {group, next}
    } else {
      group = s[1]
      target = s[0]
      this.labeled.push(group)
      return {group, target, next}
    }
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
    let group = new Group(pattern, this)
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

  /**
   * Insert key-value-pair into the Trie
   * Keys can contain very(!) simple forms of regular expressions, e.g.
   *  "oo|inf(inity)?"
   *  "-=|eq(u)?(iv|als)?"
   * @param {string} key
   * @param {*} value
   */
  insert(key, value) {
    let k, quantifier, optional, repeatable
    let current = this.trie, value_nodes = [], group_nodes = new Set()
    if (this === this.root) key = key.replace(/\\\\/, ESCAPED_BACKSLASH_REPLACEMENT)
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
        if (k === "[") {
          obj = this._parse_ranges(p, next)
          Object.assign(current, obj)
        } else {
          if (k === "(") group_info = this._parse_group(p, next)
          else group_info = this._parse_named_group(p, next, key)
          if (GROUP_KEY in current) current[GROUP_KEY].add(group_info)
          else current[GROUP_KEY] = new Set([group_info])
          group_nodes.add(current)
        }
        if (quantifiers.has(q) && qb !== "\\") {
          quantifier = q
          optional = (quantifier !== "+")
          repeatable = (quantifier !== "?")
          i++
        }
        current = next
        if (k === "[") value_nodes.forEach(node => Object.assign(node, obj))
        else value_nodes.forEach(node => {
          let tmp = node[GROUP_KEY]
          if (tmp === undefined) node[GROUP_KEY] = new Set([group_info])
          else if (tmp !== current) tmp.add(group_info)
          group_nodes.add(node)
        })
        if (optional) value_nodes.push(current)
        else value_nodes = [current]
        if (repeatable) {
          if (k === "[") {
            Object.assign(current, obj)
          } else {
            current[GROUP_KEY] = new Set([group_info])
            group_nodes.add(current)
          }
        }
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
            this.insert(key.substr(i + 1), value)
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
        if (optional) value_nodes.push(current)
        else value_nodes = [current]
        if (repeatable) current[k] = current
        if (quantifier !== null) i++
      }
    }
    // assign value to nodes that should cause a match
    if (!(VALUE_KEY in current)) current[VALUE_KEY] = value
    if (optional) { // last node is not required
      value_nodes.forEach(node => {
        if (!(VALUE_KEY in node)) node[VALUE_KEY] = value
      })
    }
    if (VALUE_KEY in this.trie) throw new Error(`TautologyInRegularExpression: ${key}`)
  }

  /**
   * Returns Value and matching string of the best matching Entry in the Trie, or null if no match
   * @param {string} str
   * @returns {{match: string, value: *}|null}
   */
  match(str) {
    let n, g, m, i = 0, current = this.trie
    for (let len = str.length; i < len; i++) {
      n = current[str[i]]
      if (n !== undefined) {
        current = n
      } else {
        g = current[GROUP_KEY]
        if (g === undefined) break
        if (g.length === 0) throw new Error("Should never happen: Empty group-list in Trie")
        for (let group_info of g) {
          if (typeof group_info.group === "string") {
            group_info.group = this.root.known[group_info.group]
          }
          m = group_info.group.match(str.substr(i))
          if (m !== null) {
            i += m.match.length - 1
            current = group_info.next
            break
          }
        }
        if (m === null) break
      }
    }
    let value = current[VALUE_KEY]
    if (value === undefined) return null
    return {match: str.substr(0, i), value}
  }
}

class Group extends Trie {
  constructor(group_key, root) {
    super(root)
    this.insert(group_key, VALUE_PLACEHOLDER)
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
