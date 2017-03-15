const VALUE_KEY = "_v"
const PLACEHOLDER_KEY = "_p" // there could be multiple placeholders at one point in the trie
const ESCAPED_BACKSLASH_REPLACEMENT = "\u0003"
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
        if (from > to) throw new Error(`InvalidRange: ${String.fromCharCode(from)} > ${String.fromCharCode(to)}`)
        for (let c = from; c <= to; c++) {
          obj[String.fromCharCode(c)] = next
        }
      }
      else obj[str[i]] = next
    }
    return obj
  }

  _parse_named_group(str, next, repeatable) {
    let identifier, target, s = str.split(":")
    if (s.length === 1) {
      identifier = s[0] // only strings for now, as it could be a circular definition
      return {identifier, next, repeatable}
    } else {
      identifier = s[1]
      target = s[0]
      return {identifier, target, next, repeatable}
    }
  }

  _insert(key, next) {
    console.log("_insert", key, next)
    let k, quantifier, optional, repeatable, current = this.trie
    let value_nodes = [], placeholder_nodes = []
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
          obj = this._parse_ranges(pattern, next)
          Object.assign(current, obj)
          if (repeatable) Object.assign(next, obj)
          value_nodes.forEach(node => Object.assign(node, obj))
        } else {
          if (k === "(") placeholder = {pattern, next, repeatable}
          else placeholder = this._parse_named_group(pattern, next, key, repeatable)
          if (PLACEHOLDER_KEY in current) {
            current[PLACEHOLDER_KEY].push(placeholder)
          } else {
            current[PLACEHOLDER_KEY] = [placeholder]
            placeholder_nodes.push(current)
          }
          value_nodes.forEach(node => {
            let tmp = node[PLACEHOLDER_KEY]
            if (tmp === undefined) {
              node[PLACEHOLDER_KEY] = [placeholder]
              placeholder_nodes.push(node)
            } else if (tmp !== current) {
              tmp.push(placeholder)
            }
          })
        }
        current = next
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
        console.log({k}, current)
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
    console.log({placeholder_nodes, value_nodes})
    // assign value to nodes that should cause a match
    for (let node of value_nodes) {
      console.log({node})
      Object.assign(node, next) // first come, LAST served now (!)
    }
    // resolve placeholders
    let parsed_placeholders = new Map()
    for (let node of placeholder_nodes) {
      for (let placeholder of new Set(node[PLACEHOLDER_KEY])) {
        let parsed = parsed_placeholders.get(placeholder)
        if(parsed === undefined) {
          let sub_trie = new Trie()
          sub_trie.known = this.known
          if(placeholder.pattern !== undefined) {
            sub_trie._insert(placeholder.pattern, next)
          }
          parsed = sub_trie.trie
          parsed_placeholders.set(placeholder, parsed)
        }
        Object.assign(node, parsed)
      }
      delete node[PLACEHOLDER_KEY]
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
    this._insert(key.replace(/\\\\/, ESCAPED_BACKSLASH_REPLACEMENT), {[VALUE_KEY]: value})
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
