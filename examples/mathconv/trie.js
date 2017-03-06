const VALUE_KEY = "_v"
const GROUP_KEY = "_g" // there could be multiple groups at one point in the trie
const VALUE_PLACEHOLDER = -1
const quantifiers = new Set(["*", "+", "?"])

export class Trie {
  constructor() {
    this.trie = {}
    this.known = {}
  }

  _type() {
    return (this instanceof Group) ? "group" : "trie"
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
   * Insert key-value-pair into the Trie
   * Keys can contain very(!) simple forms of regular expressions, e.g.
   *  "oo|inf(inity)?"
   *  "-=|eq(u)?(iv|als)?"
   * @param {string} key
   * @param {*} value
   */
  insert(key, value) {
    let quantifier, optional, repeatable, group_info
    let current = this.trie, past_nodes_since_last_required_node = []
    for (let i = 0, len = key.length; i < len; i++) {
      group_info = null
      quantifier = null
      optional = false
      repeatable = false
      // if an unescaped ( is found, handle it as a group until )
      if (key[i] === "(" && (i < 1 || key[i - 1] !== "\\") && (i < 2 || key[i - 2] !== "\\")) { // \( and \\(
        let s = key.substr(i), c = s.search(/[^\\]\)/), q = s.substr(c + 2, 1)
        if (c === -1) throw new Error(`UnclosedBracketInRegularExpression: ${s}`)
        group_info = {group: new Group(s.substr(1, c), this.root), next: {}}
        if (GROUP_KEY in current) current[GROUP_KEY].push(group_info)
        else current[GROUP_KEY] = [group_info]
        if (quantifiers.has(q)) {
          quantifier = q
          optional = (quantifier !== "+")
          repeatable = (quantifier !== "?")
          i++
        }
        current = group_info.next
        if (optional) past_nodes_since_last_required_node.push(current)
        else past_nodes_since_last_required_node = [current]
        if (repeatable) current[GROUP_KEY] = [group_info]
        i += ++c
      } else if (key[i] === "[" && (i < 1 || key[i - 1] !== "\\") && (i < 2 || key[i - 2] !== "\\")) { // \[ and \\[
        let s = key.substr(i), c = s.search(/[^\\]\]/), q = s.substr(c + 2, 1), next = {}
        if (c === -1) throw new Error(`UnclosedBracketInRegularExpression: ${s}`)
        let obj = this._parse_ranges(s.substr(1, c), next)
        Object.assign(current, obj)
        if (quantifiers.has(q)) {
          quantifier = q
          optional = (quantifier !== "+")
          repeatable = (quantifier !== "?")
          i++
        }
        current = next
        if (optional) past_nodes_since_last_required_node.push(current)
        else past_nodes_since_last_required_node = [current]
        if (repeatable) Object.assign(current, obj)
        i += ++c
      } else {
        // if an unescaped | is found, leave the rest of the key to a subsequent insert()-call
        if (key[i] === "|") {
          if (i === 0) throw new Error(`TautologyInRegularExpression: ${key}`)
          if (key[i - 1] !== "\\" && (i < 2 || key[i - 2] !== "\\")) { // \| and \\|
            this.insert(key.substr(i + 1), value)
            break
          }
        }
        // detect unescaped quantifiers, e.g. inf+i?n?i?ty
        if (quantifiers.has(key[i + 1]) && key[i] !== "\\" && (i < 1 || key[i - 1] !== "\\")) { // *+?
          quantifier = key[i + 1]
          optional = (quantifier !== "+")
          repeatable = (quantifier !== "?")
        }
        // handle backslashes
        if (key[i] === "\\") {
          if (i > 0 && key[i - 1] !== "\\") i++
        }
        // advance previous and current
        current = current[key[i]] || (current[key[i]] = {})
        past_nodes_since_last_required_node.forEach(node => {
          let tmp = node[key[i]]
          if (tmp === undefined) node[key[i]] = current
          else if (tmp !== current) Object.assign(tmp, current)
        })
        // handle quantifiers
        if (optional) past_nodes_since_last_required_node.push(current)
        else past_nodes_since_last_required_node = [current]
        if (repeatable) current[key[i]] = current
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
    if(VALUE_KEY in this.trie) throw new Error(`TautologyInRegularExpression: ${key}`)
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
    super()
    this.insert(group_key, VALUE_PLACEHOLDER)
  }
}
