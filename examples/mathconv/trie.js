const VALUE_KEY = "_v"
const GROUP_KEY = "_g" // there could be multiple groups at one point in the trie
const quantifiers = new Set(["*", "+", "?"])

let x = {
  "h": {
    "e": {
      "l": {
        "_g": [[{
          trie: {
            "l": {
              "o": {
                "_vg": undefined
              }
            }
          }
        }, "Value", "?"]]
      }
    }
  }
}

export class Trie {
  constructor() {
    this.trie = {}
  }

  /**
   * Internal implementation of insert
   * Returns a List of Nodes that hold Values
   * @param key
   * @param [value]
   * @returns {Object[]}
   */
  _insert(key, value = undefined) {
    let previous, current = this.trie
    let quantifier, optional, repeatable, group_info
    let past_nodes_since_last_required_node = []
    for (let i = 0, len = key.length; i < len; i++) {
      group_info = null
      quantifier = null
      optional = false
      repeatable = false
      // if an unescaped ( is found, handle it as a group until )
      if (i > 0 && key[i] === "(" && key[i - 1] !== "\\" && (i < 2 || key[i - 2] !== "\\")) { // \( and \\(
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
        if (!optional) {
          past_nodes_since_last_required_node = []
        }
        previous = current
        current = group_info.next
        quantifier = null
        optional = false
        repeatable = false
        i += c + 2
        if (i >= len) break
      }
      // if an unescaped | is found, leave the rest of the key to a subsequent insert()-call
      if (i > 0 && key[i] === "|" && key[i - 1] !== "\\" && (i < 2 || key[i - 2] !== "\\")) { // \| and \\|
        this.insert(key.substr(i + 1), value)
        break
      }
      // advance previous and current
      //console.log(i, "advance", (this instanceof Group) ? "group" : "trie", key[i], quantifier)
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
    this._insert(key, value)
    return this
  }

  /**
   * Returns Value and matching string of the best matching Entry in the Trie, or null if no match
   * @param {string} str
   * @returns {{match: string, value: *}}
   */
  match(str) {
    let n, g, i = 0, current = this.trie
    for (let len = str.length; i < len; i++) {
      g = null
      n = current[str[i]]
      if (n !== undefined) {
        current = n
      } else {
        g = current[GROUP_KEY]
        if (g !== undefined) {
          for (let {group, next} of g) {
            let m = group.match(str.substr(i))
            if (m !== null) {
              i += m.match.length
              n = next
            }
          }
        }
      }
    }
    if (n === undefined) return null
    return {
      match: str.substr(0, i),
      value: n[VALUE_KEY]
    }
  }
}

class Group extends Trie {
  constructor(group_key, root) {
    super()
    // if the group ends up holding values, leaf-nodes are used to store them
    // otherwise, leaf-nodes are used to store references to
    //this.leafs =
    this._insert(group_key)
    //this.root = root
  }
}
