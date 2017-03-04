const VALUE_KEY = "_v"
const RANGE_KEY = "_r" // key to store ranges, e.g. [0-9a-z], internally represented as [["0","9"],["a","z"]]
const RANGE_QUANTIFIER_KEY = "_q" // key to store a quantifier for a range, e.g. "+", "?", "*"
const RANGE_THEN_KEY = "_t" // result-node when range is matched
const quantifiers = new Set(["*", "+", "?"])

export class Trie {
  constructor() {
    this.trie = {}
    this.known = { // NAMED TOKENS
      "FLOAT": { // usage: e.g. \FLOAT
        [RANGE_KEY]: [[0, 9]],
        [RANGE_QUANTIFIER_KEY]: "+",
        [RANGE_THEN_KEY]: {
          ".": {
            [RANGE_KEY]: [[0, 9]],
            [RANGE_QUANTIFIER_KEY]: "+",
            [RANGE_THEN_KEY]: {
              [VALUE_KEY]: Infinity // TODO
            }
          }
        }
      }
    }
    this.n_values = 0
  }

  /**
   * Return a Node representing a Group
   * only provide a value, if there should be a match when satisfied!
   * @param {string} key
   * @param {*} [value]
   */
  _create_group(key, value = undefined) {
    let sub_trie = new Trie()
    sub_trie.insert(key, value)
    return sub_trie.trie
  }

  /**
   * Insert key-value-pair into the Trie
   * Keys can contain very(!) simple forms of regular expressions, e.g.
   *  "oo|inf(inity)?"
   *  "-=|eq(u)?(iv|als)?"
   * @param {string} key
   * @param {*} [value]
   */
  insert(key, value = undefined) {
    ++this.n_values
    let previous, current = this.trie
    let quantifier, optional, repeatable, past_nodes_since_last_required_node = []
    for (let i = 0, len = key.length; i < len; i++) {
      quantifier = null
      optional = false
      repeatable = false
      // if an unescaped | is found, leave the rest of the key to a subsequent insert()-call
      if (i > 0 && key[i] === "|" && key[i - 1] !== "\\" && (i < 2 || key[i - 2] !== "\\")) { // \| and \\|
        this.insert(key.substr(i + 1), value)
        break
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
      // handle backslashes
      if (key[i] === "\\") {
        if (i > 0 && key[i - 1] !== "\\") i++
      }
      // handle quantifiers
      past_nodes_since_last_required_node.forEach(node => node[key[i]] = current)
      if (optional) past_nodes_since_last_required_node.push(current)
      else past_nodes_since_last_required_node = [current]
      if (repeatable) current[key[i]] = current
      if (quantifier !== null) i++
    }
    if (value !== undefined) {
      if (!(VALUE_KEY in current)) { // first come, first serve
        current[VALUE_KEY] = value
      }
      if (optional) { // last node is not required
        past_nodes_since_last_required_node.forEach(node => {
          if (!(VALUE_KEY in node)) {
            node[VALUE_KEY] = value
          }
        })
      }
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
