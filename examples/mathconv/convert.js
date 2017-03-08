import {Parser} from "../mathconv/parser"

let GREEK_LETTER = {
  'α': 'alpha',
  'β': 'beta',
  'χ': 'chi',
  'δ': 'delta',
  'Δ': 'Delta',
  'ε': 'eps(ilon)?',
  'η': 'eta',
  'γ': 'gamma',
  'Γ': 'Gamma',
  'ι': 'iota',
  'κ': 'kappa',
  'λ': 'lambda',
  'Λ': 'Lambda',
  'μ': 'mu',
  'ν': 'nu',
  'ω': 'omega',
  'Ω': 'Omega',
  'φ': 'phi',
  'Φ': 'Phi',
  'π': 'pi',
  'Π': 'Pi',
  'ψ': 'psi',
  'Ψ': 'Psi',
  'ρ': 'rho',
  'σ': 'sigma',
  'Σ': 'Sigma',
  'τ': 'tau',
  'ϑ': 'theta',
  'Θ': 'Theta',
  'υ': 'upsilon',
  'ξ': 'xi',
  'Ξ': 'Xi',
  'ζ': 'zeta',
}

export class Ascii2Utf8Parser extends Parser {
  constructor() {
    super()
    this.trie.learn("WS", "[ \t\r\n\f]")
    this.trie.learn("GREEK_LETTER", Object.keys(GREEK_LETTER).join("|"))
    this.trie.learn("OPERATOR", "+|-")
    this.trie.insert("{left:GREEK_LETTER}{WS}*{operator:OPERATOR;binaryLeftAssociative;0}}{WS}*{right:GREEK_LETTER}", 1)
  }
}
