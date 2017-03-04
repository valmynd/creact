const VALUE_KEY = "_v"
const VALUE_PLACEHOLDER = -Infinity // \0\uD83D\uDC10
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

  /** @deprecated **/
  _get_value_nodes(current = this.trie, result = []) {
    for (let key in current) {
      if (key[0] !== "_" && current.hasOwnProperty(key)) {
        if (VALUE_KEY in current[key]) {
          result.push(current[key])
        }
        this._get_value_nodes(current[key], result)
      }
    }
    return result
  }

  /**
   * Return a Node representing a Group and the value-holding nodes within it
   * only provide a value, if there should be a match when satisfied! (usually unknown in advance...)
   * @param {string} key
   * @param {Object} node_at
   * @returns {{root: Object, leafs: Object[]}}
   */
  _create_group(key, node_at) {
    let sub_trie = new Trie()
    let value_holding_nodes = sub_trie._insert(key, node_at)
    console.log({value_holding_nodes}, {sub_trie})
    return {
      root: sub_trie.trie,
      leafs: value_holding_nodes
    }
  }

  /**
   * Internal implementation of insert
   * Returns a List of Nodes that hold Values
   * @param key
   * @param [merge_into]
   * @param [value]
   * @returns {Object[]}
   */
  _insert(key, merge_into = this.trie, value = undefined) {
    ++this.n_values
    let previous, current = merge_into
    let quantifier, optional, repeatable, group
    let past_nodes_since_last_required_node = []
    let groups_since_last_required_node = []
    for (let i = 0, len = key.length; i < len; i++) {
      group = null
      quantifier = null
      optional = false
      repeatable = false
      // if an unescaped ( is found, handle it as a group until )
      if (i > 0 && key[i] === "(" && key[i - 1] !== "\\" && (i < 2 || key[i - 2] !== "\\")) { // \( and \\(
        let s = key.substr(i), c = s.search(/[^\\]\)/)
        if (c === -1) throw new Error(`UnclosedBracketInRegularExpression: ${s}`)
        group = this._create_group(s.substr(1, c), current)
        i = i + c + 2
      }
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
      if (optional) {
        past_nodes_since_last_required_node.push(current)
        if (group !== null) groups_since_last_required_node.push(group)
      } else {
        past_nodes_since_last_required_node = [current]
        groups_since_last_required_node = []
        if (group !== null) groups_since_last_required_node.push(group)
      }
      if (repeatable) current[key[i]] = current
      if (quantifier !== null) i++
    }
    let value_holding_nodes = []
    if (!(VALUE_KEY in current)) { // first come, first serve
      if (value !== undefined) current[VALUE_KEY] = value
      value_holding_nodes.push(current)
    }
    if (optional) { // last node is not required
      past_nodes_since_last_required_node.forEach(node => {
        if (!(VALUE_KEY in node)) {
          if (value !== undefined) node[VALUE_KEY] = value
          value_holding_nodes.push(node)
        }
      })
    }
    return value_holding_nodes
  }

  /**
   * Insert key-value-pair into the Trie
   * Keys can contain very(!) simple forms of regular expressions, e.g.
   *  "oo|inf(inity)?"
   *  "-=|eq(u)?(iv|als)?"
   * @param {string} key
   * @param {*} value
   * @returns {Trie}
   */
  insert(key, value) {
    this._insert(key, this.trie, value)
    return this
  }

  /**
   * Returns Value of best matching Entry in the Trie, or null if no match
   * @param {string} str
   */
  match(str) {

  }
}
