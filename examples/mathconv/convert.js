import {Parser} from "../mathconv/parser"
const alphanumeric = /[a-zA-Z0-9]/

let greek_letters = {
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
    for (let value in greek_letters) {
      let re = greek_letters[value]
      this.literal(re, () => {
        return value
      })
    }
  }
}
