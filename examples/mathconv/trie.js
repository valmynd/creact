const VALUE_KEY = "_v"
const CAPTURE_KEY = "_c"
const TARGET_KEY = "_t"
const ESCAPED_BACKSLASH_REPLACEMENT = "\u0003"
const ESCAPED_MINUS_REPLACEMENT = "\u0003"
const ESCAPED_MINUS_REPLACEMENT_CC = ESCAPED_MINUS_REPLACEMENT.charCodeAt(0)
const quantifiers = new Set(["*", "+", "?"])
const escapable = new Set(["(", "{", "[", "|"])
const brackets = new Set(["(", "{", "["])
const r = String.raw

export class Trie {
  constructor() {
    this.trie = {}
    this.known = {}
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
        if (from === ESCAPED_MINUS_REPLACEMENT_CC) from = "-".charCodeAt(0)
        if (to === ESCAPED_MINUS_REPLACEMENT_CC) to = "-".charCodeAt(0)
        if (from > to) throw new Error(`InvalidRange: ${String.fromCharCode(from)} > ${String.fromCharCode(to)}`)
        for (let c = from; c <= to; c++) {
          obj[String.fromCharCode(c)] = next
        }
      }
      else if (str[i] === ESCAPED_MINUS_REPLACEMENT) {
        obj["-"] = next
      } else {
        obj[str[i]] = next
      }
    }
    return obj
  }

  _insert(key, next) {
    let k, quantifier, optional, repeatable, current = this.trie
    let value_nodes = [], placeholders = []
    for (let i = 0, len = key.length; i < len; i++) {
      k = key[i]
      quantifier = null
      optional = false
      repeatable = false
      // if an unescaped ( is found, handle it as a group until )
      if (brackets.has(key[i]) && key[i - 1] !== "\\") { // \( or \{ or \[
        let s = key.substr(i), placeholder, obj, next = {}
        let c = (k === "(") ? s.search(/[^\\]\)/) : (k === "{") ? s.search(/[^\\]\}/) : s.search(/[^\\]\]/)
        if (c === -1) throw new Error(`UnclosedBracketInRegularExpression: ${s}`)
        let pattern = s.substr(1, c), q = s[c + 2], qb = s[c + 1]
        if (quantifiers.has(q) && qb !== "\\") {
          quantifier = q
          optional = (quantifier !== "+")
          repeatable = (quantifier !== "?")
          i++
        }
        if (k === "[") {
          obj = this._parse_ranges(pattern.replace(/\\-/, ESCAPED_MINUS_REPLACEMENT), next)
          Object.assign(current, obj)
          if (repeatable) Object.assign(next, obj)
          value_nodes.forEach(node => Object.assign(node, obj))
        } else {
          let nodes = [current, ...value_nodes], target
          if (k === "{") {
            let s = pattern.split(":")
            if (s.length === 1) {
              pattern = this.known[s[0]]
            } else {
              pattern = this.known[s[1]]
              target = s[0]
            }
          }
          placeholders.push({pattern, target, next, repeatable, nodes})
        }
        current = next
        console.log({optional, repeatable}, k)
        if (optional) value_nodes.push(current)
        else value_nodes = [current]
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
            this._insert(key.substr(i + 1), next)
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
    for (let node of value_nodes) {
      Object.assign(node, next) // FILO
    }
    // resolve placeholders
    for (let {pattern, target, next, repeatable, nodes} of placeholders.reverse()) {
      if (target !== undefined) {
        let t = next[TARGET_KEY]
        if (t !== undefined) t.push(target)
        else next[TARGET_KEY] = [target]
      }
      let sub_trie = new Trie()
      sub_trie.known = this.known
      if (repeatable) {
        Object.assign(sub_trie.trie, next)
        next = sub_trie.trie
      }
      sub_trie._insert(pattern, next)
      let parsed = sub_trie.trie
      for (let node of new Set(nodes)) {
        Object.assign(node, parsed)
        if (target !== undefined) {
          let c = node[CAPTURE_KEY]
          if (c !== undefined) c.push(target)
          else node[CAPTURE_KEY] = [target]
        }
      }
    }
  }

  /**
   * Add a named Group
   * @example
   *  trie.define("FLOAT", r`[0-9]+(.[0-9]+)?`)
   *  trie.insert("a{FLOAT}", 1)
   *  trie.match("a4.2")
   * @param {string} identifier
   * @param {string} pattern
   */
  define(identifier, pattern) {
    this.known[identifier] = pattern.replace(/\\\\/, ESCAPED_BACKSLASH_REPLACEMENT)
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
    this._insert(key.replace(/\\\\/, ESCAPED_BACKSLASH_REPLACEMENT), {[VALUE_KEY]: value})
  }

  /**
   * Returns Value and matching string of the best matching Entry in the Trie, or null if no match
   * @param {string} str
   * @returns {{match: string, value: *}|null}
   */
  match(str) {
    let n, v, c, t, i = 0, current = this.trie, last_capture = [null, 0], capturing = {}, result = {}
    let last_value = null, last_value_i = 0
    for (let len = str.length; i <= len; i++) {
      c = current[CAPTURE_KEY]
      t = current[TARGET_KEY]
      if (t !== undefined) {
        for (let targeted of t) {
          let a = capturing[targeted]
          if (last_capture[0] !== targeted) {
            a = last_capture[1]
          }
          result[targeted] = str.substr(a, i - a)
          last_capture = [targeted, i]
        }
      }
      if (c !== undefined) {
        for (let captured of c) {
          if (!(captured in capturing)) {
            capturing[captured] = i
          }
        }
      }
      if (i === len) break
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
    if (Object.keys(result).length > 0) console.log(result, capturing)
    return {match: str.substr(0, last_value_i + 1), value: last_value}
  }
}
