import test from "ava"
import CircularJSON from "circular-json"
import {Trie} from "../dist/mathconv/trie"

const str = o => CircularJSON.stringify(o)
const r = String.raw

import a from "../dist/mathconv/asciimath"
//console.log("asciimath:", str(a))

test('Trie inf+i?n?i?t?y works', t => {
  const trie = new Trie()
  trie.insert("inf+i?n?i?t?y", 1)
  t.deepEqual(trie.match("infinity"), {value: 1, match: "infinity"})
  t.deepEqual(trie.match("infy"), {value: 1, match: "infy"})
  t.deepEqual(trie.match("infffity"), {value: 1, match: "infffity"})
  t.true(trie.match("inffofity") === null)
  t.true(trie.match("inf") === null)
  trie.insert("inf+i?n?i?t?y?", 2)
  t.deepEqual(trie.match("inf"), {value: 2, match: "inf"})
  t.deepEqual(trie.match("infinity"), {value: 1, match: "infinity"})
  //console.log((trie.trie["i"]["n"]["f"]))
})

test('Trie hel(lo) works', t => { // hel(la|(lo)+)?
  const trie = new Trie()
  trie.insert(r`hel(lo)`, 1)
  t.deepEqual(trie.match("hello"), {value: 1, match: "hello"})
})

test('Trie hel(lo)?ya works', t => { // hel(la|(lo)+)?
  const trie = new Trie()
  trie.insert(r`hel(lo)?ya`, 1)
  t.deepEqual(trie.match("helya"), {value: 1, match: "helya"})
  t.deepEqual(trie.match("helloya"), {value: 1, match: "helloya"})
  t.true(trie.match("hellya") === null)
  //console.log(str(trie.trie))
})

test('Trie hel(lo)+ya works', t => { // hel(la|(lo)+)?
  const trie = new Trie()
  //console.log((trie.trie["h"]["e"]["l"]["_g"][0]))
  trie.insert(r`hel(lo)+ya`, 1)
  t.deepEqual(trie.match("helloya"), {value: 1, match: "helloya"})
  t.deepEqual(trie.match("helloloya"), {value: 1, match: "helloloya"})
  t.true(trie.match("hellollya") === null) // should NOT match
  t.true(trie.match("helloolya") === null) // caused endless loop before
})

test('Trie a[0-9]*z works', t => {
  let trie = new Trie()
  trie.insert(r`a[0-9]*z`, 1)
  t.deepEqual(trie.match("a2017z"), {value: 1, match: "a2017z"})
  trie = new Trie()
  trie.insert(r`a[0-9]*z?`, 1) // a2?z? does work
  t.deepEqual(trie.match("a"), {value: 1, match: "a"})
  t.deepEqual(trie.match("a2z"), {value: 1, match: "a2z"})
  t.deepEqual(trie.match("a2"), {value: 1, match: "a2"})
  t.deepEqual(trie.match("a"), {value: 1, match: "a"})
  t.deepEqual(trie.match("a90000"), {value: 1, match: "a90000"})
})

test('Trie [0-9]+(.[0-9]+)? works', t => {
  const trie = new Trie()
  trie.insert(r`[0-9]+(.[0-9]+)?`, 1)
  t.deepEqual(trie.match("21.91"), {value: 1, match: "21.91"})
  t.deepEqual(trie.match("21"), {value: 1, match: "21"})
  t.deepEqual(trie.match("21."), {value: 1, match: "21"})
})

test('Trie named groups work', t => {
  const trie = new Trie()
  trie.learn("FLOAT", r`[0-9]+(.[0-9]+)`)
  trie.insert("a{FLOAT}?", 1)
  t.deepEqual(trie.match("a4.2"), {value: 1, match: "a4.2"})
  t.deepEqual(trie.match("a"), {value: 1, match: "a"})
})

test('Trie backslash handling works', t => {
  let trie = new Trie()
  trie.insert(r`a\{FLOAT}?`, 1)
  t.deepEqual(trie.match("a{FLOAT"), {value: 1, match: "a{FLOAT"})
  trie = new Trie()
  trie.learn("FLOAT", r`[0-9]+(.[0-9]+)?`)
  trie.insert(r`a\\{FLOAT}?`, 1)
  //console.log(trie.trie["a"]["\\"]["_g"][0])
  t.deepEqual(trie.match("a\\2.22"), {value: 1, match: "a\\2.22"})
})

test('Trie {GREEK_LETTER}{WS}*(+|-){WS}*{GREEK_LETTER} works', t => {
  let trie = new Trie()
  trie.learn("WS", "[ \t\r\n\f]")
  trie.learn("GREEK_LETTER", Object.keys(a.TOKENS.GREEK_LETTER).join("|"))
  trie.insert("{GREEK_LETTER}(+|-){GREEK_LETTER}", 1)
  t.deepEqual(trie.match("α+α"), {value: 1, match: "α+α"})
  trie = new Trie()
  trie.insert("[a-c][0-2]?[d-f]?[3-5]?[g-h]", 1)
  t.deepEqual(trie.match("ag"), {value: 1, match: "ag"})
  t.true(trie.match("a") === null)
  trie.insert("[a-c][0-2]?[d-f]?[3-5]?[g-h]?", 2)
  t.deepEqual(trie.match("a"), {value: 2, match: "a"})
  //t.deepEqual(trie.match("ag"), {value: 1, match:"ag"}) ??
})
