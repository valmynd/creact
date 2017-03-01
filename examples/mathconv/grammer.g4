// source: https://github.com/camoy/amath (license: public domain)

grammar calculator;

Accent
    : 'hat'       { $$ = accent(t0, '^') }
    | 'bar'       { $$ = accent(t0, '¯') }
    | 'overline'  { $$ = accent(t0, '¯') }
    | 'ul'        { $$ = accent(t0, '_') }
    | 'underline' { $$ = accent(t0, '_') }
    | 'vec'       { $$ = accent(t0, '→') }
    | 'dot'       { $$ = accent(t0, '.') }
    | 'ddot'      { $$ = accent(t0, '..') }
    | 'tilde'     { $$ = accent(t0, '~') }
    ;

Font
    : 'bbb'    { $$ = font(t0, 'double-struck') }
    | 'bb'     { $$ = font(t0, 'bold') }
    | 'cc'     { $$ = font(t0, 'script') }
    | 'tt'     { $$ = font(t0, 'monospace') }
    | 'fr'     { $$ = font(t0, 'fraktur') }
    | 'sf'     { $$ = font(t0, 'sans-serif') }
    ;

Op  : Arrow
    | Logic
    | Misc
    | Rel
    | Unders
    | Symbol
    ;

Left
    : '{:'      { $$ = mk_str('') }
    | '(:'      { $$ = mk_str('⟨') }
    | 'langle'  { $$ = mk_str('⟨') }
    | '<<'      { $$ = mk_str('⟨') }
    | '('       { $$ = mk_str('(') }
    | '['       { $$ = mk_str('[') }
    | '{'       { $$ = mk_str(LCURLY) }
    ;

Right
    : ':}'      { $$ = mk_str('') }
    | ':)'      { $$ = mk_str('⟩') }
    | 'rangle'  { $$ = mk_str('⟩') }
    | '>>'      { $$ = mk_str('⟩') }
    | ')'       { $$ = mk_str(')') }
    | ']'       { $$ = mk_str(']') }
    | ' }'       { $$ = mk_str(RCURLY) }
    ;

Symbol
    : '+'       { $$ = mk_op('+') }
    | '!'       { $$ = mk_op('!') }
    | '-:'      { $$ = mk_op('÷') }
    | 'div'     { $$ = mk_op('÷') }
    | '-'       { $$ = mk_op('−') }
    | '***'     { $$ = mk_op('⋆') }
    | 'star'    { $$ = mk_op('⋆') }
    | '**'      { $$ = mk_op('∗') }
    | 'ast'     { $$ = mk_op('∗') }
    | '*'       { $$ = mk_op('⋅') }
    | 'cdot'    { $$ = mk_op('⋅') }
    | '//'      { $$ = mk_op('/') }
    | '\\\\'    { $$ = mk_op('\\') }
    | '|><|'    { $$ = mk_op('⋈') }
    | 'bowtie'  { $$ = mk_op('⋈') }
    | '|><'     { $$ = mk_op('⋉') }
    | 'ltimes'  { $$ = mk_op('⋉') }
    | 'xx'      { $$ = mk_op('×') }
    | 'times'   { $$ = mk_op('×') }
    | '@'       { $$ = mk_op('∘') }
    | 'circ'    { $$ = mk_op('∘') }
    | 'o+'      { $$ = mk_op('⊕') }
    | 'oplus'   { $$ = mk_op('⊕') }
    | 'ox'      { $$ = mk_op('⊗') }
    | 'otimes'  { $$ = mk_op('⊗') }
    | 'o.'      { $$ = mk_op('⊙') }
    | 'odot'    { $$ = mk_op('⊙') }
    | '^^'      { $$ = mk_op('∧') }
    | 'wedge'   { $$ = mk_op('∧') }
    | 'vv'      { $$ = mk_op('∨') }
    | 'vee'     { $$ = mk_op('∨') }
    | 'nn'      { $$ = mk_op('∩') }
    | 'cap'     { $$ = mk_op('∩') }
    | 'uu'      { $$ = mk_op('∪') }
    | 'cup'     { $$ = mk_op('∪') }
    ;

Unders
    : 'sum'     { $$ = mk_underover('Σ') }
    | 'prod'    { $$ = mk_underover('Π') }
    | '^^^'     { $$ = mk_underover('⋀') }
    | 'bigwedge'    { $$ = mk_underover('⋀') }
    | 'vvv'     { $$ = mk_underover('⋁') }
    | 'bigvee'  { $$ = mk_underover('⋁') }
    | 'nnn'     { $$ = mk_underover('⋂') }
    | 'bigcap'  { $$ = mk_underover('⋂') }
    | 'uuu'     { $$ = mk_underover('⋃') }
    | 'bigcup'  { $$ = mk_underover('⋃') }
    | 'lim'     { $$ = mk_underover('lim') }
    | 'Lim'     { $$ = mk_underover('Lim') }
    | 'min'     { $$ = mk_underover('min') }
    | 'max'     { $$ = mk_underover('max') }
    ;

Rel : '='       { $$ = mk_op('=') }
    | '!='      { $$ = mk_op('≠') }
    | 'ne'      { $$ = mk_op('≠') }
    | ':='      { $$ = mk_op('≔') }
    | '-<='     { $$ = mk_op('⪯') }
    | 'preceq'  { $$ = mk_op('⪯') }
    | '-<'      { $$ = mk_op('≺') }
    | 'prec'    { $$ = mk_op('≺') }
    | '<='      { $$ = mk_op('≤') }
    | 'le'      { $$ = mk_op('≤') }
    | 'lt='     { $$ = mk_op('≤') }
    | 'leq'     { $$ = mk_op('≤') }
    | '<'       { $$ = mk_op('&lt;') }
    | '><|'     { $$ = mk_op('⋊') }
    | 'rtimes'  { $$ = mk_op('⋊') }
    | '>='      { $$ = mk_op('≥') }
    | 'ge'      { $$ = mk_op('≥') }
    | 'gt='     { $$ = mk_op('≥') }
    | 'geq'     { $$ = mk_op('≥') }
    | '>-='     { $$ = mk_op('⪰') }
    | 'succeq'  { $$ = mk_op('⪰') }
    | '>-'      { $$ = mk_op('≻') }
    | 'succ'    { $$ = mk_op('≻') }
    | '>'       { $$ = mk_op('&gt;') }
    | 'in'      { $$ = mk_op('∈') }
    | '!in'     { $$ = mk_op('∉') }
    | 'notin'   { $$ = mk_op('∉') }
    | 'sube'    { $$ = mk_op('⊆') }
    | 'subseteq'    { $$ = mk_op('⊆') }
    | 'sub'     { $$ = mk_op('⊂') }
    | 'subset'  { $$ = mk_op('⊂') }
    | 'supe'    { $$ = mk_op('⊇') }
    | 'supseteq'    { $$ = mk_op('⊇') }
    | 'sup'     { $$ = mk_op('⊃') }
    | 'supset'  { $$ = mk_op('⊃') }
    | '-='      { $$ = mk_op('≡') }
    | 'equiv'   { $$ = mk_op('≡') }
    | '~='      { $$ = mk_op('≌') }
    | 'cong'    { $$ = mk_op('≌') }
    | '~~'      { $$ = mk_op('≈') }
    | 'approx'  { $$ = mk_op('≈') }
    | 'prop'    { $$ = mk_op('∝') }
    | 'propto'  { $$ = mk_op('∝') }
    ;

Logic
    : 'and'     { $$ = mk_op('and') }
    | 'or'      { $$ = mk_op('or') }
    | 'not'     { $$ = mk_op('¬') }
    | 'neg'     { $$ = mk_op('¬') }
    | '=>'      { $$ = mk_op('⇒') }
    | 'implies' { $$ = mk_op('⇒') }
    | 'if'      { $$ = mk_op('if') }
    | '<=>'     { $$ = mk_op('⇔') }
    | 'iff'     { $$ = mk_op('⇔') }
    | 'AA'      { $$ = mk_op('∀') }
    | 'forall'  { $$ = mk_op('∀') }
    | 'EE'      { $$ = mk_op('∃') }
    | 'exists'  { $$ = mk_op('∃') }
    | '_|_'     { $$ = mk_op('⊥') }
    | 'bot'     { $$ = mk_op('⊥') }
    | 'TT'      { $$ = mk_op('⊤') }
    | 'top'     { $$ = mk_op('⊤') }
    | '|--'     { $$ = mk_op('⊢') }
    | 'vdash'   { $$ = mk_op('⊢') }
    | '|=='     { $$ = mk_op('⊨') }
    | 'models'  { $$ = mk_op('⊨') }
    ;

Misc
    : 'int'     { $$ = mk_op('∫') }
    | 'oint'    { $$ = mk_op('∮') }
    | 'del'     { $$ = mk_op('∂') }
    | 'partial' { $$ = mk_op('∂') }
    | 'grad'    { $$ = mk_op('∇') }
    | 'nabla'   { $$ = mk_op('∇') }
    | '+-'      { $$ = mk_op('±') }
    | 'pm'      { $$ = mk_op('±') }
    | 'O/'      { $$ = mk_op('∅') }
    | 'emptyset'    { $$ = mk_op('∅') }
    | 'oo'      { $$ = mk_op('∞') }
    | 'infty'   { $$ = mk_op('∞') }
    | 'aleph'   { $$ = mk_op('ℵ') }
    | '...'     { $$ = mk_op('…') }
    | 'ldots'   { $$ = mk_op('…') }
    | ':.'      { $$ = mk_op('∴') }
    | 'therefore'   { $$ = mk_op('∴') }
    | '/_'      { $$ = mk_op('∠') }
    | 'angle'   { $$ = mk_op('∠') }
    | '/_\\'    { $$ = mk_op('△') }
    | 'triangle'    { $$ = mk_op('△') }
    | '''       { $$ = mk_op('′') }
    | 'prime'   { $$ = mk_op('′') }
    | '\\ '     { $$ = mk_op('&nbsp;') }
    | 'frown'   { $$ = mk_op('⌢') }
    | 'quad'    { $$ = mk_op('&nbsp;&nbsp;') }
    | 'qquad'   { $$ = mk_op('&nbsp;&nbsp;&nbsp;&nbsp;') }
    | 'cdots'   { $$ = mk_op('⋯') }
    | 'vdots'   { $$ = mk_op('⋮') }
    | 'ddots'   { $$ = mk_op('⋱') }
    | 'diamond' { $$ = mk_op('⋄') }
    | 'square'  { $$ = mk_op('□') }
    | '|__'     { $$ = mk_op('⌊') }
    | 'lfloor'  { $$ = mk_op('⌊') }
    | '__|'     { $$ = mk_op('⌋') }
    | 'rfloor'  { $$ = mk_op('⌋') }
    | '|~'      { $$ = mk_op('⌈') }
    | 'lceiling'    { $$ = mk_op('⌈') }
    | '~|'      { $$ = mk_op('⌉') }
    | 'rceiling'    { $$ = mk_op('⌉') }
    | 'CC'      { =('ℂ') }
    | 'NN'      { =('ℕ') }
    | 'QQ'      { =('ℚ') }
    | 'RR'      { =('ℝ') }
    | 'ZZ'      { =('ℤ') }
    ;

Arrow
    : 'uarr'            { $$ = mk_op('↑') }
    | 'uparrow'         { $$ = mk_op('↑') }
    | 'darr'            { $$ = mk_op('↓') }
    | 'downarrow'       { $$ = mk_op('↓') }
    | 'rarr'            { $$ = mk_op('→') }
    | 'rightarrow'      { $$ = mk_op('→') }
    | '|->'             { $$ = mk_op('↦') }
    | 'mapsto'          { $$ = mk_op('↦') }
    | 'larr'            { $$ = mk_op('←') }
    | 'leftarrow'       { $$ = mk_op('←') }
    | 'harr'            { $$ = mk_op('↔') }
    | 'rArr'            { $$ = mk_op('⇒') }
    | 'Rightarrow'      { $$ = mk_op('⇒') }
    | 'lArr'            { $$ = mk_op('⇐') }
    | 'Leftarrow'       { $$ = mk_op('⇐') }
    | 'hArr'            { $$ = mk_op('⇔') }
    | '>->>'            { $$ = mk_op('⤖') }
    | '>->'             { $$ = mk_op('↣') }
    | '->>'             { $$ = mk_op('↠') }
    | '->'              { $$ = mk_op('→') }
    | 'to'              { $$ = mk_op('→') }
    | 'twoheadrightarrowtail'   { $$ = mk_op('⤖') }
    | 'rightarrowtail'      { $$ = mk_op('↣') }
    | 'twoheadrightarrow'       { $$ = mk_op('↠') }
    | 'leftrightarrow'      { $$ = mk_op('↔') }
    | 'Leftrightarrow'      { $$ = mk_op('⇔') }
    ;

Greek
    : 'alpha'   { () => 'α' }
    | 'beta'    { () => 'β' }
    | 'chi'     { () => 'χ' }
    | 'delta'   { () => 'δ' }
    | 'Delta'   { () => 'Δ' }
    | 'epsilon' { () => 'ε' }
    | 'eta'     { () => 'η' }
    | 'gamma'   { () => 'γ' }
    | 'Gamma'   { () => 'Γ' }
    | 'iota'    { () => 'ι' }
    | 'kappa'   { () => 'κ' }
    | 'lambda'  { () => 'λ' }
    | 'Lambda'  { () => 'Λ' }
    | 'lamda'   { () => 'λ' }
    | 'Lamda'   { () => 'Λ' }
    | 'mu'      { () => 'μ' }
    | 'nu'      { () => 'ν' }
    | 'omega'   { () => 'ω' }
    | 'Omega'   { () => 'Ω' }
    | 'phi'     { () => 'φ' }
    | 'varphi'  { () => 'φ' }
    | 'Phi'     { () => 'Φ' }
    | 'pi'      { () => 'π' }
    | 'Pi'      { () => 'Π' }
    | 'psi'     { () => 'ψ' }
    | 'Psi'     { () => 'Ψ' }
    | 'rho'     { () => 'ρ' }
    | 'sigma'   { () => 'σ' }
    | 'Sigma'   { () => 'Σ' }
    | 'tau'     { () => 'τ' }
    | 'theta'   { () => 'ϑ' }
    | 'Theta'   { () => 'Θ' }
    | 'upsilon' { () => 'υ' }
    | 'xi'      { () => 'ξ' }
    | 'Xi'      { () => 'Ξ' }
    | 'zeta'    { () => 'ζ' }
    | 'α'
    | 'β'
    | 'χ'
    | 'δ'
    | 'Δ'
    | 'ε'
    | 'η'
    | 'γ'
    | 'Γ'
    | 'ι'
    | 'κ'
    | 'λ'
    | 'Λ'
    | 'λ'
    | 'Λ'
    | 'μ'
    | 'ν'
    | 'ω'
    | 'Ω'
    | 'φ'
    | 'φ'
    | 'Φ'
    | 'π'
    | 'Π'
    | 'ψ'
    | 'Ψ'
    | 'ρ'
    | 'σ'
    | 'Σ'
    | 'τ'
    | 'ϑ'
    | 'Θ'
    | 'υ'
    | 'ξ'
    | 'Ξ'
    | 'ζ'
    ;

STD : 'sin'
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
