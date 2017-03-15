const accents = new Map([ // tag is mostly "mover" except for "ul" where tag="munder"
  ["hat", "\u005E"],
  ["bar", "\u00AF", "overline"],
  ["ul", "\u0332", "underline"],
  ["vec", "\u2192"],
  ["dot", "."], // will need special treatment?
  ["ddot", ".."], // will need special treatment?
])

const font_commands = new Map([ // maps to values for the "mathvariant"-attribute in MathML
  ["bb", "bold"],
  ["bbb", "double-struck"],
  ["cc", "script"],
  ["tt", "mono"],
  ["fr", "fraktur"],
  ["sf", "sans-serif"],
])

const other = {
  "sqrt": {tag: "msqrt", utf8: "sqrt"}, // 1 parameter
  "root": {tag: "mroot", utf8: "root"}, // 2 parameters
  "frac": {tag: "mfrac", utf8: "/"}, // 2 parameters
  "stackrel": {tag: "mover", utf8: "stackrel"}, // 2 parameters
  "_": {tag: "msub", utf8: "_"}, // 1 parameter
  "^": {tag: "msup", utf8: "^"}, // 1 parameter
  "ubrace": {tag: "munder", utf8: "\u23DF", tex: "underbrace"}, // 1 parameter
  "obrace": {tag: "mover", utf8: "\u23DE", tex: "overbrace"}, // 1 parameter
}


const simple_ascii2latex_mapping = new Map([
  ...operation_symbols.map(_map_func_ascii2latex),
  ...miscellaneous_symbols.map(_map_func_ascii2latex),
  ...relation_symbols.map(_map_func_ascii2latex),
  ...greek_letters.map(_map_func_ascii2latex),
  ...logical_symbols.map(_map_func_ascii2latex),
  ...grouping_brackets.map(_map_func_ascii2latex),
  ...arrows.map(_map_func_ascii2utf8),
  ...standard_functions.map(s => [s, s])
])

const constants = [
  ...greek_letters,
  ...miscellaneous_symbols,
]

const binary_operators = [
  ...operation_symbols,
  ...relation_symbols,
  ...logical_symbols,
  ...arrows,
]

const unary_operators = [
  ...standard_functions.map(s => [s, s])
]


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

class TrieTodo {
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

  _merge_groups(group_nodes) {
    // merge group-nodes with the trie
    for (let node of group_nodes) {
      for (let {group, next, repeatable} of node[PLACEHOLDER_KEY]) {
        Object.assign(node, group.trie)
        if (repeatable) Object.assign(next, group.trie)
        group.value_nodes.forEach(vn => {
          Object.assign(vn, next)
        })
        this._merge_groups(group.group_nodes)

      }
      delete node[PLACEHOLDER_KEY]
    }
  }
}
