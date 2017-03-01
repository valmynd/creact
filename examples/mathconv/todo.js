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
