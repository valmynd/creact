import test from "ava"
import {Ascii2Utf8Parser} from "../dist/mathconv/convert"
import {Trie} from "../dist/mathconv/trie"

const parser = new Ascii2Utf8Parser()
const str = o => JSON.stringify(o)

test('Trie inf+i?n?i?t?y works correctly', t => {
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

test.skip('Trie hel(lo) works correctly', t => { // hel(la|(lo)+)?
  const trie = new Trie()
  trie.insert(String.raw`hel(lo)`, 1)
  t.deepEqual(trie.match("hello"), {value: 1, match: "hello"})
})

test('Trie hel(lo)?ya works correctly', t => { // hel(la|(lo)+)?
  const trie = new Trie()
  trie.insert(String.raw`hel(lo)?ya`, 1)
  t.deepEqual(trie.match("helya"), {value: 1, match: "helya"})
  t.deepEqual(trie.match("helloya"), {value: 1, match: "helloya"})
  t.true(trie.match("hellya") === null)
  //console.log(str(trie.trie))
})

test('Trie hel(lo)+ya works correctly', t => { // hel(la|(lo)+)?
  const trie = new Trie()
  //console.log((trie.trie["h"]["e"]["l"]["_g"][0]))
  trie.insert(String.raw`hel(lo)+ya`, 1)
  t.deepEqual(trie.match("helloya"), {value: 1, match: "helloya"})
  t.deepEqual(trie.match("helloloya"), {value: 1, match: "helloloya"})
  t.true(trie.match("hellollya") === null) // should NOT match
  t.true(trie.match("helloolya") === null) // caused endless loop before
})


test.skip('Ascii2Utf8Parser works correctly', t => {
  t.deepEqual(parser.parse("alpha + beta * kappa"), ['α', '+', 'β', '⋅', 'κ'])
  t.deepEqual(parser.parse("beta ** kappa"), ['β', '∗', 'κ'])
  //console.log("parse-result:", parser.parse("sum_(i=1)^n i^3=((n(n+1))/2)^2"))
})
