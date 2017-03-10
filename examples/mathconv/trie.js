const VALUE_KEY = "_v"
const VALUE_PLACEHOLDER = -1
const ESCAPED_BACKSLASH_REPLACEMENT = "\u0003"
const quantifiers = new Set(["*", "+", "?"])
const escapable = new Set(["(", "{", "[", "|"])
const brackets = new Set(["(", "{", "["])
const r = String.raw

export class Trie {
  constructor() {
    this.trie = {}
  }

  _parse_ranges(str, next) {
    // assume single-characters for now, \u0000 etc. later! NO [^...]-support
    // \u0000 etc can be handled as such: http://stackoverflow.com/questions/7885096/
    if (/^-|-.?-|-$/.test(str)) throw new Error(`InvalidRangeSyntax: ${str}`)
    let tmp = {}, to, from
    for (let i = 0, len = str.length; i < len; i++) {
      if (str[i + 1] === "-") {
        from = str.charCodeAt(i++)
        to = str.charCodeAt(++i)
        if (from > to) throw new Error(`InvalidRange: ${String.fromCharCode(from)} > ${String.fromCharCode(to)}`)
        for (let c = from; c <= to; c++) {
          tmp[String.fromCharCode(c)] = next
        }
      }
      else tmp[str[i]] = next
    }
    return tmp
  }

  _parse_group(str, next) {
    let tmp = new Trie()
    let value_nodes = tmp._insert_at(str, tmp.trie)
    value_nodes.forEach(node => {
      Object.assign(node, next)
      console.log(node, next, value_nodes.length)
    })
    return tmp.trie
  }

  _parse_named_group(str, next) {
    let group, target, group_info, root = this.root, s = str.split(":")
    if (s.length === 1) {
      group = s[0] // only strings for now, could be circular definition, replaced in _resolve()
      group_info = {group, next}
    } else {
      group = s[1]
      target = s[0]
      this.labeled.push(s[1])
      group_info = {group, target, next}
    }
    let g = root.known[group]
    if (g !== undefined) group_info.group = g
    else root.unresolved.set(group, group_info)
    return group_info
  }

  _resolve() {
    for (let [group_name, group_info] of this.unresolved) {
      let group = this.known[group_name]
      if (group === undefined) throw new Error(`UnresolvableGroup: ${group_name}`)
      group_info.group = group
    }
    this.unresolved.clear()
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

  _insert_at(key, at) {
    let k, quantifier, optional, repeatable
    let current = at, past_nodes_since_last_required_node = []
    for (let i = 0, len = key.length; i < len; i++) {
      k = key[i]
      quantifier = null
      optional = false
      repeatable = false
      // if an unescaped ( is found, handle it as a group until )
      if (brackets.has(key[i]) && key[i - 1] !== "\\") { // \( or \{ or \[
        let s = key.substr(i), obj, next = {}
        let c = (k === "(") ? s.search(/[^\\]\)/) : (k === "{") ? s.search(/[^\\]\}/) : s.search(/[^\\]\]/)
        if (c === -1) throw new Error(`UnclosedBracketInRegularExpression: ${s}`)
        let p = s.substr(1, c), q = s[c + 2], qb = s[c + 1]
        if (k === "[") obj = this._parse_ranges(p, next)
        else if (k === "(") obj = this._parse_group(p, next)
        else obj = this._parse_named_group(p, next, key)
        Object.assign(current, obj)
        if (quantifiers.has(q) && qb !== "\\") {
          quantifier = q
          optional = (quantifier !== "+")
          repeatable = (quantifier !== "?")
          i++
        }
        current = next
        past_nodes_since_last_required_node.forEach(node => Object.assign(node, obj))
        if (optional) past_nodes_since_last_required_node.push(current)
        else past_nodes_since_last_required_node = [current]
        if (repeatable) Object.assign(current, obj)
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
            past_nodes_since_last_required_node.push(...this._insert_at(key.substr(i + 1), at))
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
        past_nodes_since_last_required_node.forEach(node => {
          let tmp = node[k]
          if (tmp === undefined) node[k] = current
          else if (tmp !== current) Object.assign(tmp, current)
        })
        // handle quantifiers
        if (optional) past_nodes_since_last_required_node.push(current)
        else past_nodes_since_last_required_node = [current]
        if (repeatable) current[k] = current
        if (quantifier !== null) i++
      }
    }
    // assign value to nodes that should cause a match
    if (optional) past_nodes_since_last_required_node.push(current)
    else past_nodes_since_last_required_node = [current]
    return past_nodes_since_last_required_node
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
    let value_nodes = this._insert_at(key.replace(/\\\\/, ESCAPED_BACKSLASH_REPLACEMENT), this.trie)
    value_nodes.forEach(node => {
      if (!(VALUE_KEY in node)) node[VALUE_KEY] = value
    })
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
      if (n !== undefined) current = n
      else break
    }
    let value = current[VALUE_KEY]
    if (value === undefined) return null
    return {match: str.substr(0, i), value}
  }
}
