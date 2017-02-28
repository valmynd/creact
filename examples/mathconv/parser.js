const SKIP = () => null
const ws = /^\s+/

/**
 * @typedef {Object} Symbol
 * @property {RegExp} re
 * @property {int} bp
 * @property {function} [nud]
 * @property {function} [led]
 * @property {function} [ned]
 */

/**
 * @typedef {Symbol} Token
 * @property {string} value
 * @property {int} from
 * @property {int} to
 */

/**
 * @callback UnaryOperandHandler
 * @param {*} operand
 */

/**
 * @callback BinaryOperandHandler
 * @param {*} left
 * @param {*} right
 */


export class Parser {
  constructor() {
    this.src = null
    this.previousToken = null
    this.currentToken = null
    this.recognized = new Map()
    this.ignored = new Map()
  }

  /**
   * Internal: define a Symbol or adjust an existing one
   * @param {RegExp} re
   * @param {int} bp
   * @param {function|undefined} [nud]
   * @param {function|undefined} [led]
   */
  _define(re, bp = 0, nud, led) {
    let s = this.recognized.get(re.source)
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
      s = {re, bp, nud, led}
      this.recognized.set(re.source, s)
    }
  }

  literal(re, callback) {
    this._define(re, 0, () => callback(this.previousToken.value))
  }

  /**
   * define Binary Left-Associative Operator
   * @param {RegExp} re
   * @param {int} bp
   * @param {BinaryOperandHandler} callback
   */
  binaryLeftAssociative(re, bp, callback) {
    this._define(re, bp, undefined, (left) => callback(left, this.parseExpression(bp)))
  }

  /**
   * define Binary Right-Associative Operator
   * @param {RegExp} re
   * @param {int} bp
   * @param {BinaryOperandHandler} callback
   */
  binaryRightAssociative(re, bp, callback) {
    this._define(re, bp, undefined, (left) => callback(left, this.parseExpression(bp - 1)))
  }

  /**
   * define Unary Prefix Operator
   * @param {RegExp} re
   * @param {int} bp
   * @param {UnaryOperandHandler} callback
   */
  unaryPrefix(re, bp, callback) {
    this._define(re, bp, () => callback(this.parseExpression(bp)))
  }

  /**
   * define Unary Postfix Operator
   * @param {RegExp} re
   * @param {int} bp
   * @param {UnaryOperandHandler} callback
   */
  unaryPostfix(re, bp, callback) {
    this._define(re, bp, undefined, () => callback(this.parseExpression(bp - 1)))
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
    // iterate through to-be-skipped regexp's
    for (let skip of this.ignored.values()) {
      matches = skip.re.exec(s)
      if (matches !== null) {
        let value = matches[0], to = from + value.length
        this.previousToken = this.currentToken
        this.currentToken = {value, from, to, nud: () => SKIP}
        return this.currentToken
      }
    }
    // iterate through symbols
    for (let symbol of this.recognized.values()) {
      matches = symbol.re.exec(s)
      if (matches !== null) {
        let value = matches[0], to = from + value.length
        let token = Object.create(symbol)
        token.value = value
        token.from = from
        token.to = to
        this.previousToken = this.currentToken
        this.currentToken = token
        return this.currentToken
      }
    }
    // nothing suitable was found
    throw `UnknownExpression: ${s}`
  }

  /**
   * @param {RegExp} re
   */
  startIgnoring(re) {
    let s = re.source, sk = this.ignored.get(s)
    this.ignored.set(s, {re, v: (sk === undefined) ? 0 : sk.v + 1})
  }

  /**
   * @param {RegExp} re
   */
  stopIgnoring(re) {
    let s = re.source, sk = this.ignored.get(s)
    if (sk.v > 0) this.ignored.set(s, {re, v: sk.v - 1})
    else this.ignored.delete(s)
  }

  /**
   * @param {int} bp
   * @returns {Token}
   */
  parseExpression(bp) {
    this.previousToken = this.currentToken
    this.currentToken = this.advance()
    let left = this.previousToken.nud()
    while (bp < this.currentToken.bp) {
      this.previousToken = this.currentToken
      this.currentToken = this.advance()
      if (!this.previousToken.led) {
        console.log("noLED", bp, this.ignored.values(), "\n\t", this.previousToken, this.currentToken, this.src.substr(this.previousToken.to))
      }
      left = this.previousToken.led(left)
    }
    return left
  }

  /**
   * @param {RegExp} until
   * @returns {Token}
   */
  parseStatement(until) {
    this.startIgnoring(until)
    let ret = this.parseExpression(0)
    this.stopIgnoring(until)
    return ret
  }

  /**
   * @param {RegExp} until
   * @returns {Token[]}
   */
  parseStatements(until) {
    this.startIgnoring(until)
    let statements = [], len = this.src.length
    while (this.currentToken.to <= len && this.currentToken.from !== len) {
      let statement = this.parseStatement(/^[;\n]+/)
      if (statement !== SKIP) {
        statements.push(statement)
      } else if (until.test(this.previousToken.value)) {
        break
      }
    }
    this.stopIgnoring(until)
    return statements
  }

  /**
   * @param {string} input
   * @returns {Token[]}
   */
  parse(input) {
    console.log(input, "ignored:", this.ignored, "recognized:", this.recognized)
    this.src = input
    this.currentToken = null
    this.previousToken = this.advance()
    return this.parseStatements(/^$/)
  }
}
