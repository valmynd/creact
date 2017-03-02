// derived from: https://github.com/camoy/amath (license: public domain)
// see https://github.com/camoy/amath/blob/master/src/amath.leg

grammar asciimath;

Accent
    : 'hat'       { $$ = accent(t0, '^</mo>' }
    | 'bar'       { $$ = accent(t0, '¯</mo>' }
    | 'overline'  { $$ = accent(t0, '¯</mo>' }
    | 'ul'        { $$ = accent(t0, '_</mo>' }
    | 'underline' { $$ = accent(t0, '_</mo>' }
    | 'vec'       { $$ = accent(t0, '→</mo>' }
    | 'dot'       { $$ = accent(t0, '.</mo>' }
    | 'ddot'      { $$ = accent(t0, '..</mo>' }
    | 'tilde'     { $$ = accent(t0, '~</mo>' }
    ;

Font
    : 'bbb'    { $$ = font(t0, 'double-struck</mo>' }
    | 'bb'     { $$ = font(t0, 'bold</mo>' }
    | 'cc'     { $$ = font(t0, 'script</mo>' }
    | 'tt'     { $$ = font(t0, 'monospace</mo>' }
    | 'fr'     { $$ = font(t0, 'fraktur</mo>' }
    | 'sf'     { $$ = font(t0, 'sans-serif</mo>' }
    ;

Op  : Arrow
    | Logic
    | Misc
    | Rel
    | Sets
    | Symbol
    ;

Left
    : '(:|<<|langle'  { () => '<mo>⟨</mo>' }
    | '('             { () => '<mo>(</mo>' }
    | '['             { () => '<mo>[</mo>' }
    | '{'             { () => '<mo>}</mo>' }
    ;

Right
    : ':)|>>|rangle'  { () => '<mo>⟩</mo>' }
    | ')'             { () => '<mo>)</mo>' }
    | ']'             { () => '<mo>]</mo>' }
    | '}'             { () => '<mo>}</mo>' }
    ;

Symbol
    : '+'             { () => '<mo>+</mo>' }
    | '-'             { () => '<mo>−</mo>' }
    | '!'             { () => '<mo>!</mo>' }
    | '-:|div'        { () => '<mo>÷</mo>' }
    | '***|star'      { () => '<mo>⋆</mo>' }
    | '**|ast'        { () => '<mo>∗</mo>' }
    | '*|cdot'        { () => '<mo>⋅</mo>' }
    | '//'            { () => '<mo>/</mo>' }
    | '\\\\'          { () => '<mo>\\</mo>' }
    | 'bowtie'        { () => '<mo>⋈</mo>' }
    | 'ltimes'        { () => '<mo>⋉</mo>' }
    | 'xx|times'      { () => '<mo>×</mo>' }
    | '@|circ'        { () => '<mo>∘</mo>' }
    | 'o+|oplus|xor'  { () => '<mo>⊕</mo>' }
    | 'ox|otimes'     { () => '<mo>⊗</mo>' }
    | 'o.|odot'       { () => '<mo>⊙</mo>' }
    ;

//@unaryPrefix
Unary
    : 'sqrt' s        { (s) => '<msqrt>s</msqrt>' }
    | 'sum'           { (s) => '<mo>Σ</mo>' }
    | 'prod'          { (s) => '<mo>Π</mo>' }
    ;

Sets
    : 'bigcap'        { () => '<mo>⋂</mo>' }
    | 'bigcup'        { () => '<mo>⋃</mo>' }
    | 'cap'           { () => '<mo>∩</mo>' }
    | 'cup'           { () => '<mo>∪</mo>' }
    | 'lim'           { () => '<mo>lim</mo>' }
    | 'Lim'           { () => '<mo>Lim</mo>' }
    | 'min'           { () => '<mo>min</mo>' }
    | 'max'           { () => '<mo>max</mo>' }
    ;

Rel
    : '='             { () => '<mo>=</mo>' }
    | '!=|ne'         { () => '<mo>≠</mo>' }
    | ':='            { () => '<mo>≔</mo>' }
    | '-<=|preceq'    { () => '<mo>⪯</mo>' }
    | '-<|prec'       { () => '<mo>≺</mo>' }
    | '<=|le|lt=|leq' { () => '<mo>≤</mo>' }
    | '<|lt'          { () => '<mo>&lt;</mo>' }
    | '><\\|rtimes'   { () => '<mo>⋊</mo>' }
    | '>=|ge|gt=|geq' { () => '<mo>≥</mo>' }
    | '>-=|succeq'    { () => '<mo>⪰</mo>' }
    | '>-|succ'       { () => '<mo>≻</mo>' }
    | '>|gt'          { () => '<mo>&gt;</mo>' }
    | 'in|element'    { () => '<mo>∈</mo>' }
    | '!in|!element'  { () => '<mo>∉</mo>' }
    | 'sub(set)?e(q)?'{ () => '<mo>⊆</mo>' }
    | 'sub(set)?'     { () => '<mo>⊂</mo>' }
    | 'sup(set)?e(q)?'{ () => '<mo>⊇</mo>' }
    | 'sup(set)?'     { () => '<mo>⊃</mo>' }
    | '-=|eq(u)?(iv)?(als)?' { () => '<mo>≡</mo>' }
    | '~=|cong'       { () => '<mo>≌</mo>' }
    | '~~|approx'     { () => '<mo>≈</mo>' }
    | 'prop(to)?'     { () => '<mo>∝</mo>' }
    ;

Logic
    : 'and|wedge'     { () => '<mo>∧</mo>' }
    | 'And|bigwedge'  { () => '<mo>⋀</mo>' }
    | 'or|vee'        { () => '<mo>∨</mo>' }
    | 'Or|bigvee'     { () => '<mo>⋁</mo>' }
    | 'not|neg'       { () => '<mo>¬</mo>' }
    | '=>|impl(y|ies)'{ () => '<mo>⇒</mo>' }
    | 'if'            { () => '<mo>if</mo>' }
    | '<=>|iff'       { () => '<mo>⇔</mo>' }
    | 'forall'        { () => '<mo>∀</mo>' }
    | 'exists'        { () => '<mo>∃</mo>' }
    | 'bot(tom)?'     { () => '<mo>⊥</mo>' }
    | 'top'           { () => '<mo>⊤</mo>' }
    | '\\|--|vdash'   { () => '<mo>⊢</mo>' }
    | '\\|==|models'  { () => '<mo>⊨</mo>' }
    ;

Misc
    : 'int'           { () => '<mo>∫</mo>' }
    | 'oint'          { () => '<mo>∮</mo>' }
    | 'del|partial'   { () => '<mo>∂</mo>' }
    | 'grad|nabla'    { () => '<mo>∇</mo>' }
    | '+-|pm'         { () => '<mo>±</mo>' }
    | 'O/|empty(set)?'{ () => '<mo>∅</mo>' }
    | 'oo|inf(inity)?'{ () => '<mo>∞</mo>' }
    | 'aleph'         { () => '<mo>ℵ</mo>' }
    | '...|ldots'     { () => '<mo>…</mo>' }
    | ':.|therefore'  { () => '<mo>∴</mo>' }
    | '/_'            { () => '<mo>∠</mo>' }
    | 'angle'         { () => '<mo>∠</mo>' }
    | '/_\\|triangle' { () => '<mo>△</mo>' }
    | 'prime'         { () => '<mo>′</mo>' }
    | '\\ '           { () => '<mo>&nbsp;</mo>' }
    | 'frown'         { () => '<mo>⌢</mo>' }
    | 'quad'          { () => '<mo>&nbsp;&nbsp;</mo>' }
    | 'qquad'         { () => '<mo>&nbsp;&nbsp;&nbsp;&nbsp;</mo>' }
    | 'cdots'         { () => '<mo>⋯</mo>' }
    | 'vdots'         { () => '<mo>⋮</mo>' }
    | 'ddots'         { () => '<mo>⋱</mo>' }
    | 'diamond'       { () => '<mo>⋄</mo>' }
    | 'square'        { () => '<mo>□</mo>' }
    | '\\|__|lfloor'  { () => '<mo>⌊</mo>' }
    | '__\\||rfloor'  { () => '<mo>⌋</mo>' }
    | '\\|~|lceiling' { () => '<mo>⌈</mo>' }
    | '~\\||rceiling' { () => '<mo>⌉</mo>' }
    | 'C(C)?'         { () => '<mi>ℂ</mi>' }
    | 'N(N)?'         { () => '<mi>ℕ</mi>' }
    | 'Q(Q)?'         { () => '<mi>ℚ</mi>' }
    | 'R(R)?'         { () => '<mi>ℝ</mi>' }
    | 'Z(Z)?'         { () => '<mi>ℤ</mi>' }
    ;

Arrow
    : 'u(p)?arr(ow)?'               { () => '<mo>↑</mo>' }
    | 'd(own)?arr(ow)?'             { () => '<mo>↓</mo>' }
    | '->|r(ight)?arr(ow)?'         { () => '<mo>→</mo>' }
    | '<-|l(eft)?arr(ow)?'          { () => '<mo>←</mo>' }
    | '<->|l(eft)?r(ight)?arr(ow)?' { () => '<mo>↔</mo>' }
    | '\\|->|mapsto'                { () => '<mo>↦</mo>' }
    | '=>|R(ight)?arr(ow)?'         { () => '<mo>⇒</mo>' }
    | '<=|L(eft)?arr(ow)?'          { () => '<mo>⇐</mo>' }
    | '<=>|L(eft)?r(ight)?arr(ow)?' { () => '<mo>⇔</mo>' }
    | '>->'                         { () => '<mo>↣</mo>' }
    | '->>'                         { () => '<mo>↠</mo>' }
    ;

Greek
    : 'α|alpha'       { () => '<mi>α</mi>' }
    | 'β|beta'        { () => '<mi>β</mi>' }
    | 'χ|chi'         { () => '<mi>χ</mi>' }
    | 'δ|delta'       { () => '<mi>δ</mi>' }
    | 'Δ|Delta'       { () => '<mi>Δ</mi>' }
    | 'ε|eps(ilon)?'  { () => '<mi>ε</mi>' }
    | 'η|eta'         { () => '<mi>η</mi>' }
    | 'γ|gamma'       { () => '<mi>γ</mi>' }
    | 'Γ|Gamma'       { () => '<mi>Γ</mi>' }
    | 'ι|iota'        { () => '<mi>ι</mi>' }
    | 'κ|kappa'       { () => '<mi>κ</mi>' }
    | 'λ|lambda'      { () => '<mi>λ</mi>' }
    | 'Λ|Lambda'      { () => '<mi>Λ</mi>' }
    | 'λ|lamda'       { () => '<mi>λ</mi>' }
    | 'Λ|Lamda'       { () => '<mi>Λ</mi>' }
    | 'μ|mu'          { () => '<mi>μ</mi>' }
    | 'ν|nu'          { () => '<mi>ν</mi>' }
    | 'ω|omega'       { () => '<mi>ω</mi>' }
    | 'Ω|Omega'       { () => '<mi>Ω</mi>' }
    | 'φ|phi'         { () => '<mi>φ</mi>' }
    | 'Φ|Phi'         { () => '<mi>Φ</mi>' }
    | 'π|pi'          { () => '<mi>π</mi>' }
    | 'Π|Pi'          { () => '<mi>Π</mi>' }
    | 'ψ|psi'         { () => '<mi>ψ</mi>' }
    | 'Ψ|Psi'         { () => '<mi>Ψ</mi>' }
    | 'ρ|rho'         { () => '<mi>ρ</mi>' }
    | 'σ|sigma'       { () => '<mi>σ</mi>' }
    | 'Σ|Sigma'       { () => '<mi>Σ</mi>' }
    | 'τ|tau'         { () => '<mi>τ</mi>' }
    | 'ϑ|theta'       { () => '<mi>ϑ</mi>' }
    | 'Θ|Theta'       { () => '<mi>Θ</mi>' }
    | 'υ|upsilon'     { () => '<mi>υ</mi>' }
    | 'ξ|xi'          { () => '<mi>ξ</mi>' }
    | 'Ξ|Xi'          { () => '<mi>Ξ</mi>' }
    | 'ζ|zeta'        { () => '<mi>ζ</mi>' }
    ;

// TOKENS

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
