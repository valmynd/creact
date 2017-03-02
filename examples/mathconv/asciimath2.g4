// derived from: https://github.com/camoy/amath (license: public domain)
// see https://github.com/camoy/amath/blob/master/src/amath.leg

grammar asciimath2;

// TOKENS

LEFT_BRACKET
    : '⟨' = '(:|<<|langle'
    | '('
    | '['
    | '{'
    ;

RIGHT_BRACKET
    : '⟩' = ':)|>>|rangle'
    | ')'
    | ']'
    | '}'
    ;

CALC_SYMBOL
    : '+'
    | '−' = '-'
    | '!' = '!'
    | '÷' = '-:|div'
    | '⋆' = '***|star'
    | '∗' = '**|ast'
    | '⋅' = '*|cdot'
    | '/' = '//'
    | '\\' = '\\\\'
    | '⋈' = 'bowtie'
    | '⋉' = 'ltimes'
    | '×' = 'xx|times'
    | '∘' = '@|circ'
    | '⊕' = 'o+|xor|oplus'
    | '⊗' = 'ox|otimes'
    | '⊙' = 'o.|odot'
    ;

//@unaryPrefix
UNARY_SYMBOL
    : 'sqrt'
    | 'Σ' = 'sum'
    | 'Π' = 'prod'
    ;

SET_SYMBOL
    : '⋂' = 'bigcap'
    | '⋃' = 'bigcup'
    | '∩' = 'cap'
    | '∪' = 'cup'
    | 'lim'
    | 'Lim'
    | 'min'
    | 'max'
    ;

RELATION_SYMBOL
    : '='
    | '≠' = '!=|ne'
    | '≔' = ':='
    | '⪯' = '-<=|preceq'
    | '≺' = '-<|prec'
    | '≤' = '<=|le|lt=|leq'
    | '&lt;' = '<|lt'
    | '⋊' = '><\|rtimes'
    | '≥' = '>=|ge|gt=|geq'
    | '⪰' = '>-=|succeq'
    | '≻' = '>-' = 'succ'
    | '&gt;' = '>|gt'
    | '∈' = 'element' = 'in'
    | '∉' = '!in|!element' = 'notin'
    | '⊆' = 'sub(set)?e(q)?'
    | '⊂' = 'sub(set)?'
    | '⊇' = 'sup(set)?e(q)?'
    | '⊃' = 'sup(set)?'
    | '≡' = '-=|eq(u)?(iv)?(als)?'
    | '≌' = '~=|cong'
    | '≈' = '~~|approx'
    | '∝' = 'prop(to)?'
    ;

LOGIC_SYMBOL
    : '∧' = 'and|wedge'
    | '⋀' = 'And|bigwedge'
    | '∨' = 'or|vee'
    | '⋁' = 'Or|bigvee'
    | '¬' = 'not|neg'
    | '⇒' = '=>|impl(y|ies)'
    | 'if' = 'if'
    | '⇔' = '<=>|iff'
    | '∀' = 'forall'
    | '∃' = 'exists'
    | '⊥' = 'bot(tom)?'
    | '⊤' = 'top'
    | '⊢' = '\|--|vdash'
    | '⊨' = '\|==|models'
    ;

MISC_SYMBOL
    : '∫' = 'int'
    | '∮' = 'oint'
    | '∂' = 'del|partial'
    | '∇' = 'grad|nabla'
    | '±' = '+-|pm'
    | '∅' = 'O/|empty(set)?'
    | '∞' = 'oo|inf(inity)?'
    | 'ℵ' = 'aleph'
    | '…' = '...|ldots'
    | '∴' = ':.|therefore'
    | '∠' = '/_|angle'
    | '△' = '/_\|triangle'
    | '′' = 'prime'
    | '&nbsp;' = '\\ '
    | '⌢' = 'frown'
    | '&nbsp;&nbsp;' = 'quad'
    | '&nbsp;&nbsp;&nbsp;&nbsp;' = 'qquad'
    | '⋯' = 'cdots'
    | '⋮' = 'vdots'
    | '⋱' = 'ddots'
    | '⋄' = 'diamond'
    | '□' = 'square'
    | '⌊' = 'lfloor'
    | '⌋' = 'rfloor'
    | '⌈' = 'lceiling'
    | '⌉' = 'rceiling'
    | 'ℂ' = 'C(C)?'
    | 'ℕ' = 'N(N)?'
    | 'ℚ' = 'Q(Q)?'
    | 'ℝ' = 'R(R)?'
    | 'ℤ' = 'Z(Z)?'
    ;

ARROW_SYMBOL
    : '↑' = 'u(p)?arr(ow)?'
    | '↓' = 'd(own)?arr(ow)?'
    | '→' = '->|r(ight)?arr(ow)?'
    | '←' = '<-|l(eft)?arr(ow)?'
    | '↔' = '<->|l(eft)?r(ight)?arr(ow)?'
    | '↦' = '\|->|mapsto'
    | '⇒' = '=>|R(ight)?arr(ow)?'
    | '⇐' = '<=|L(eft)?arr(ow)?'
    | '⇔' = '<=>|L(eft)?r(ight)?arr(ow)?'
    | '↣' = '>->'
    | '↠' = '->>'
    ;

GREEK_LETTER
    : 'α' = 'alpha'
    | 'β' = 'beta'
    | 'χ' = 'chi'
    | 'δ' = 'delta'
    | 'Δ' = 'Delta'
    | 'ε' = 'eps'('ilon')?
    | 'η' = 'eta'
    | 'γ' = 'gamma'
    | 'Γ' = 'Gamma'
    | 'ι' = 'iota'
    | 'κ' = 'kappa'
    | 'λ' = 'lambda'
    | 'Λ' = 'Lambda'
    | 'λ' = 'lamda'
    | 'Λ' = 'Lamda'
    | 'μ' = 'mu'
    | 'ν' = 'nu'
    | 'ω' = 'omega'
    | 'Ω' = 'Omega'
    | 'φ' = 'phi'
    | 'Φ' = 'Phi'
    | 'π' = 'pi'
    | 'Π' = 'Pi'
    | 'ψ' = 'psi'
    | 'Ψ' = 'Psi'
    | 'ρ' = 'rho'
    | 'σ' = 'sigma'
    | 'Σ' = 'Sigma'
    | 'τ' = 'tau'
    | 'ϑ' = 'theta'
    | 'Θ' = 'Theta'
    | 'υ' = 'upsilon'
    | 'ξ' = 'xi'
    | 'Ξ' = 'Xi'
    | 'ζ' = 'zeta'
    ;

STANDARD_FUNCTION_NAME
    : 'sin'
    | 'cos'
    | 'tan'
    | 'sinh'
    | 'cosh'
    | 'tanh'
    | 'cot'
    | 'sec'
    | 'csc'
    | 'arcsin'
    | 'arccos'
    | 'arctan'
    | 'coth'
    | 'sech'
    | 'csch'
    | 'exp'
    | 'log'
    | 'ln'
    | 'lg'
    | 'det'
    | 'dim'
    | 'mod'
    | 'gcd'
    | 'lcm'
    | 'lub'
    | 'glb'
    ;

ID  : [a-zA-Z];
NUMBER  : [0-9]+ ('.' [0-9]+)?;
