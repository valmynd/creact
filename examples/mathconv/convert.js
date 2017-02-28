import {Parser} from "./parser"

// triples with ascii-math as first item, utf8 as second item, latex as third item (fallback=first item)
const _map_func_ascii2utf8 = tuple => [tuple[0], tuple[1] ? tuple[1] : tuple[0]]
const _map_func_ascii2latex = tuple => [tuple[0], tuple[2] ? tuple[2] : tuple[0]]

const operation_symbols = [ // tag = "mo"
  ["+"],
  ["-"],
  ["*", "\u22C5", "cdot"],
  ["**", "\u2217", "ast"],
  ["***", "\u22C6", "star"],
  ["//", "/"],
  ["\\\\", "\\", "backslash"],
  ["xx", "\u00D7", "times"],
  ["-:", "\u00F7", "div"],
  ["@", "\u2218", "circ"],
  ["o+", "\u2295", "oplus"],
  ["ox", "\u2297", "otimes"],
  ["o.", "\u2299", "odot"],
  ["sum", "\u2211"],
  ["prod", "\u220F"],
  ["^^", "\u2227", "wedge"],
  ["^^^", "\u22C0", "bigwedge"],
  ["vv", "\u2228", "vee"],
  ["vvv", "\u22C1", "bigvee"],
  ["nn", "\u2229", "cap"],
  ["nnn", "\u22C2", "bigcap"],
  ["uu", "\u222A", "cup"],
  ["uuu", "\u22C3", "bigcup"],
]

const miscellaneous_symbols = [ // tag = "mo"
  ["int", "\u222B"],
  ["oint", "\u222E"],
  ["del", "\u2202", "partial"],
  ["grad", "\u2207", "nabla"],
  ["+-", "\u00B1", "pm"],
  ["O/", "\u2205", "emptyset"],
  ["oo", "\u221E", "infty"],
  ["aleph", "\u2135"],
  ["/_", "\u2220", "angle"],
  ["/_\\", "\u25B3", "triangle"],
  [":.", "\u2234", "therefore"],
  ["...", "...", "ldots"],
  ["cdots", "\u22EF"],
  ["vdots", "\u22EE"],
  ["ddots", "\u22F1"],
  ["\\ ", "\u00A0"],
  ["quad", "\u00A0\u00A0"],
  ["diamond", "\u22C4"],
  ["square", "\u25A1"],
  ["|__", "\u230A", "lfloor"],
  ["__|", "\u230B", "rfloor"],
  ["|~", "\u2308", "lceiling"],
  ["~|", "\u2309", "rceiling"],
  ["CC", "\u2102"],
  ["NN", "\u2115"],
  ["QQ", "\u211A"],
  ["RR", "\u211D"],
  ["ZZ", "\u2124"]
]


const relation_symbols = [ // tag = "mo"
  ["="],
  ["!=", "\u2260", "ne"],
  ["<", "<"],
  [">", ">"],
  ["<=", "\u2264", "le"],
  [">=", "\u2265", "ge"],
  ["-<", "\u227A", "prec"],
  [">-", "\u227B", "succ"],
  ["-<=", "\u2AAF", "preceq"],
  [">-=", "\u2AB0", "succeq"],
  ["in", "\u2208"],
  ["!in", "\u2209", "notin"],
  ["sub", "\u2282", "subset"],
  ["sup", "\u2283", "supset"],
  ["sube", "\u2286", "subseteq"],
  ["supe", "\u2287", "supseteq"],
  ["-=", "\u2261", "equiv"],
  ["~=", "\u2245", "cong"],
  ["~~", "\u2248", "approx"],
  ["prop", "\u221D", "propto"]
]

const greek_letters = [ // tag = "mi" (?)
  ["alpha", "\u03B1"],
  ["beta", "\u03B2"],
  ["chi", "\u03C7"],
  ["delta", "\u03B4"],
  ["Delta", "\u0394"],
  ["epsilon", "\u03B5"],
  ["eta", "\u03B7"],
  ["gamma", "\u03B3"],
  ["Gamma", "\u0393"],
  ["iota", "\u03B9"],
  ["kappa", "\u03BA"],
  ["lambda", "\u03BB"],
  ["Lambda", "\u039B"],
  ["lamda", "\u03BB"],
  ["Lamda", "\u039B"],
  ["mu", "\u03BC"],
  ["nu", "\u03BD"],
  ["omega", "\u03C9"],
  ["Omega", "\u03A9"],
  ["phi", "\u03D5"],
  ["Phi", "\u03A6"],
  ["pi", "\u03C0"],
  ["Pi", "\u03A0"],
  ["psi", "\u03C8"],
  ["Psi", "\u03A8"],
  ["rho", "\u03C1"],
  ["sigma", "\u03C3"],
  ["Sigma", "\u03A3"],
  ["tau", "\u03C4"],
  ["theta", "\u03B8"],
  ["Theta", "\u0398"],
  ["upsilon", "\u03C5"],
  ["xi", "\u03BE"],
  ["Xi", "\u039E"],
  ["zeta", "\u03B6"]
]

const logical_symbols = [ // tag = "mo"
  ["and"],
  ["or"],
  ["not", "\u00AC", "neg"],
  ["=>", "\u21D2", "implies"],
  ["if"],
  ["iff", "\u21D4", "iff"],
  ["<=>", "\u21D4", "iff"],
  ["AA", "\u2200", "forall"],
  ["EE", "\u2203", "exists"],
  ["_|_", "\u22A5", "bot"],
  ["TT", "\u22A4", "top"],
  ["|--", "\u22A2", "vdash"],
  ["|==", "\u22A8", "models"],
]

const grouping_brackets = [ // tag = "mo"
  ["("],
  [")"],
  ["["],
  ["]"],
  ["{"],
  ["}"],
  ["|"],
  ["(:", "\u2329", "langle"],
  [":)", "\u232A", "rangle"],
  ["<<", "\u2329"],
  [">>", "\u232A"],
  ["{:"],
  [":}"]
]

const arrows = [  // tag = "mo"
  ["uarr", "\u2191", "uparrow"],
  ["darr", "\u2193", "downarrow"],
  ["rarr", "\u2192", "rightarrow"],
  ["->", "\u2192", "to"],
  ["|->", "\u21A6", "mapsto"],
  ["larr", "\u2190", "leftarrow"],
  ["harr", "\u2194", "arrow"],
  ["rArr", "\u21D2", "Rightarrow"],
  ["lArr", "\u21D0", "Leftarrow"],
  ["hArr", "\u21D4", "arrow"]
]

const standard_functions = [ // tag = "mo"
  "lim",
  "Lim",
  "sin",
  "cos",
  "tan",
  "sinh",
  "cosh",
  "tanh",
  "cot",
  "sec",
  "csc",
  "arcsin",
  "arccos",
  "arctan",
  "coth",
  "sech",
  "csch",
  "exp",
  "abs",
  "norm",
  "floor",
  "ceil",
  "log",
  "ln",
  "det",
  "dim",
  "mod",
  "gcd",
  "lcm",
  "lub",
  "glb",
  "min",
  "max"
]

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

const simple_ascii2utf8_mapping = new Map([
  ...operation_symbols.map(_map_func_ascii2utf8),
  ...miscellaneous_symbols.map(_map_func_ascii2utf8),
  ...relation_symbols.map(_map_func_ascii2utf8),
  ...greek_letters.map(_map_func_ascii2utf8),
  ...logical_symbols.map(_map_func_ascii2utf8),
  ...grouping_brackets.map(_map_func_ascii2utf8),
  ...arrows.map(_map_func_ascii2utf8),
  ...standard_functions.map(s => [s, s])
])

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

function _re(string) {
  let r = "^"
  for (let i = 0, len = string.length; i < len; i++) {
    if(string[i] === "\\") r += "[\\\\]"
    else r += "[" + string[i] + "]"
  }
  return new RegExp(r)
}

export class Ascii2Utf8Parser extends Parser {
  constructor(map = simple_ascii2utf8_mapping) {
    super()
    for (let [ascii, utf8] of greek_letters) {
      const re = _re(ascii)
      this.literal(re, found => {
        return utf8
      })
    }
    for (let [operator, utf8] of operation_symbols) {
      const re = _re(operator)
      this.binaryLeftAssociative(re, 100, (left, right) => {
        return left + map.get(operator) + right
      })
    }
  }
}
