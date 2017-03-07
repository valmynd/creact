const VALUE_KEY = "_v"
const GROUP_KEY = "_g" // there could be multiple groups at one point in the trie
const VALUE_PLACEHOLDER = -1
const ESCAPED_BACKSLASH_REPLACEMENT = "\u0003"
const quantifiers = new Set(["*", "+", "?"])
const escapable = new Set(["(", "{", "[", "|"])
const brackets = new Set(["(", "{", "["])
const r = String.raw

export class Trie {
  constructor(root = null) {
    this.trie = {}
    this.root = root
    this.symbols = null
    if (root === null) { // not instanceOf Group
      this.root = this
      this.symbols = {}
      //this.learn("FLOAT", r`[0-9]+(.[0-9]+)?`)
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

  /**
   * Add a named Group
   * @example
   *  trie.learn("FLOAT", r`[0-9]+(.[0-9]+)?`)
   *  trie.insert("a{FLOAT}", 1)
   *  trie.match("a4.2")
   * @param {string} identifier
   * @param {string} pattern
   */
  learn(identifier, pattern) {
    this.symbols[identifier] = new Group(pattern, this)
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
    let current = this.trie, past_nodes_since_last_required_node = []
    if (this === this.root) key = key.replace(/\\\\/, ESCAPED_BACKSLASH_REPLACEMENT)
    //console.log(key)
    for (let i = 0, len = key.length; i < len; i++) {
      k = key[i]
      quantifier = null
      optional = false
      repeatable = false
      // if an unescaped ( is found, handle it as a group until )
      if (brackets.has(key[i]) && key[i - 1] !== "\\") { // \( or \{ or \[
        let s = key.substr(i), group, obj, next = {}
        let c = (k === "(") ? s.search(/[^\\]\)/) : (k === "{") ? s.search(/[^\\]\}/) : s.search(/[^\\]\]/)
        if (c === -1) throw new Error(`UnclosedBracketInRegularExpression: ${s}`)
        let p = s.substr(1, c), q = s[c + 2], qb = s[c + 1]
        if (k === "[") {
          obj = this._parse_ranges(p, next)
          Object.assign(current, obj)
        } else {
          group = (k === "{") ? this.root.symbols[p] : new Group(p, this.root)
          if (group === undefined) throw new Error(`UnknownNamedGroupInRegularExpression: ${p} in ${s}`)
          if (GROUP_KEY in current) current[GROUP_KEY].push({group, next})
          else current[GROUP_KEY] = [{group, next}]
        }
        if (quantifiers.has(q) && qb !== "\\") {
          quantifier = q
          optional = (quantifier !== "+")
          repeatable = (quantifier !== "?")
          i++
        }
        current = next
        if (optional) past_nodes_since_last_required_node.push(current)
        else past_nodes_since_last_required_node = [current]
        if (repeatable && k === "[") Object.assign(current, obj)
        if (repeatable && k !== "[") current[GROUP_KEY] = [{group, next}]
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
    if (!(VALUE_KEY in current)) current[VALUE_KEY] = value
    if (optional) { // last node is not required
      past_nodes_since_last_required_node.forEach(node => {
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
        for (let {group, next} of g) {
          m = group.match(str.substr(i))
          if (m !== null) {
            i += m.match.length - 1
            current = next
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
}
