const VALUE_KEY = "_v"
const RANGE_KEY = "_k" // e.g. [0-9a-zA-Z]
const PATTERN_KEY = "_p" // e.g. *, +, ?
const quantifiers = new Set(["*", "+", "?"])

export class Trie {
  constructor() {
    this.trie = {}
    this.n_values = 0
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
    ++this.n_values
    let previous, current = this.trie
    let past_nodes_since_last_required_node = []
    for (let i = 0, len = key.length; i < len; i++) {
      let quantifier = null, optional = false, repeatable = false
      // if an unescaped | is found, leave the rest of the key to a subsequent insert()-call
      if (i > 0 && key[i] === "|" && key[i - 1] !== "\\" && (i < 2 || key[i - 2] !== "\\")) { // \| and \\|
        this.insert(key.substr(i + 1), value)
        break
      }
      // handle (escaped?) backslashes
      if (key[i] === "\\") {
        if (i > 0 && key[i - 1] !== "\\") i++ // needs testing
      }
      // advance previous and current
      previous = current
      current = previous[key[i]]
      if (current === undefined) {
        previous[key[i]] = {}
        current = previous[key[i]]
      }
      // detect unescaped quantifiers, e.g. inf+i?n?i?ty
      if (quantifiers.has(key[i + 1]) && key[i] !== "\\" && (i < 1 || key[i - 1] !== "\\")) { // *+?
        quantifier = key[i + 1]
        optional = (quantifier !== "+")
        repeatable = (quantifier !== "?")
      }
      // handle quantifiers
      past_nodes_since_last_required_node.forEach(node => node[key[i]] = current)
      if (optional) past_nodes_since_last_required_node.push(current)
      else past_nodes_since_last_required_node = [current]
      if (repeatable) current[key[i]] = current
      if (quantifier !== null) i++
    }
    if (!(VALUE_KEY in current)) { // first come, first serve
      current[VALUE_KEY] = value
    }
    return this
  }

  /**
   * Returns Value of best matching Entry in the Trie, or null if no match
   * @param {string} str
   */
  match(str) {

  }
}
