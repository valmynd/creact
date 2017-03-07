import {Trie} from "./trie"

const SKIP = () => null
const ws = /^\s+/

/**
 * @typedef {Object} Symbol
 * @property {string} re
 * @property {int} bp
 * @property {function} [nud]
 * @property {function} [led]
 */

/**
 * @typedef {Symbol} Token
 * @property {string} value
 * @property {int} from
 * @property {int} to
 */

/**
 * @callback UnaryOperandHandler
 * @param {string} operand
 */

/**
 * @callback BinaryOperandHandler
 * @param {string} left
 * @param {string} right
 */


export class Parser {
  constructor() {
    this.trie = new Trie()
    this.src = null
    this.previousToken = null
    this.currentToken = null
    this.symbols = {}
  }

  /**
   * Internal: define a Symbol or adjust an existing one
   * @param {string} re
   * @param {int} bp
   * @param {function|undefined} [nud]
   * @param {function|undefined} [led]
   */
  _define(re, bp = 0, nud, led) {
    let s = this.symbols[re]
    if (s !== undefined) {
      if (bp >= s.bp) s.bp = bp
      if (nud !== undefined) {
        if (s.nud === undefined) s.nud = nud
        else throw "AlreadyDefinedNud"
      }
      if (led !== undefined) {
        if (s.led === undefined) s.led = led
        else throw "AlreadyDefinedLed"
      }
    } else {
      s = {re, bp}
      if (nud !== undefined) s.nud = nud
      if (led !== undefined) s.led = led
      this.symbols[re] = s
    }
  }

  literal(re, callback) {
    this._define(re, 0, () => callback(this.previousToken.value))
  }

  /**
   * define Binary Left-Associative Operator
   * @param {string} re
   * @param {int} bp
   * @param {BinaryOperandHandler} callback
   */
  binaryLeftAssociative(re, bp, callback) {
    this._define(re, bp, undefined, (left) => callback(left, this.parseExpression(bp).value))
  }

  /**
   * define Binary Right-Associative Operator
   * @param {string} re
   * @param {int} bp
   * @param {BinaryOperandHandler} callback
   */
  binaryRightAssociative(re, bp, callback) {
    this._define(re, bp, undefined, (left) => callback(left, this.parseExpression(bp - 1).value))
  }

  /**
   * define Unary Prefix Operator
   * @param {string} re
   * @param {int} bp
   * @param {UnaryOperandHandler} callback
   */
  unaryPrefix(re, bp, callback) {
    this._define(re, bp, () => callback(this.parseExpression(bp).value))
  }

  /**
   * define Unary Postfix Operator
   * @param {string} re
   * @param {int} bp
   * @param {UnaryOperandHandler} callback
   */
  unaryPostfix(re, bp, callback) {
    this._define(re, bp, undefined, () => callback(this.parseExpression(bp - 1).value))
  }

  /**
   * @returns {Token}
   */
  advance() {
    // skip whitespaces
    let from = (this.currentToken === null) ? 0 : this.currentToken.to,
      s = this.src.substr(from),
      matches = ws.exec(s)
    if (matches !== null) {
      from += matches[0].length
      s = this.src.substr(from)
    }
    // iterate through symbols
    /*for (let symbol of this.recognized.values()) {
     matches = symbol.re.exec(s)
     if (matches !== null) {
     //console.log(symbol.re.source, {matches})
     let value = matches[0], to = from + value.length
     let token = Object.create(symbol)
     token.value = value
     token.from = from
     token.to = to
     this.previousToken = this.currentToken
     this.currentToken = token
     return this.currentToken
     }
     }*/
    // nothing suitable was found
    throw `UnknownExpression: ${s}`
  }

  /**
   * @param {int} bp
   * @returns {Token}
   */
  parseExpression(bp = 0) {
    this.previousToken = this.currentToken
    this.currentToken = this.advance()
    let left = this.previousToken.nud()
    while (bp < this.currentToken.bp) {
      this.previousToken = this.currentToken
      this.currentToken = this.advance()
      left = this.previousToken.led(left)
    }
    return left
  }

  /**
   * @param {string} input
   * @returns {Token[]}
   */
  parse(input) {
    this.src = input
    this.currentToken = null
    this.previousToken = this.advance()
    return this.parseStatements(/^$/)
  }
}
