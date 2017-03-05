import test from "ava"
import {Ascii2Utf8Parser} from "../dist/mathconv/convert"
import {Trie} from "../dist/mathconv/trie"

const parser = new Ascii2Utf8Parser()

test('Trie epsil?o?n? works correctly', t => {
  const trie = new Trie()
  trie.insert("epsil?o?n?", 1)
  t.true(trie.trie["e"]["p"]["s"]["i"]["_v"] === 1)
  t.true(trie.trie["e"]["p"]["s"]["i"]["l"]["_v"] === 1)
  t.true(trie.trie["e"]["p"]["s"]["i"]["n"]["_v"] === 1)
  t.true(trie.trie["e"]["p"]["s"]["i"]["l"]["o"]["_v"] === 1)
  trie.insert(String.raw`epsi\?l?o?n?`, 1)
  t.true(trie.trie["e"]["p"]["s"]["i"]["?"]["_v"] === 1)
  trie.insert(String.raw`epsi\\?l?o?n?`, 1)
  t.true(trie.trie["e"]["p"]["s"]["i"]["\\"]["?"]["_v"] === 1)
  //console.log(JSON.stringify(trie.trie))
})

test('Trie inf+i?n?i?t?y works correctly', t => {
  const trie = new Trie()
  trie.insert("inf+i?n?i?t?y", 1)
  t.deepEqual(trie.match("infinity"), {value: 1, match: "infinity"})
  t.deepEqual(trie.match("infffity"), {value: 1, match: "infffity"})
})

test('Trie hel(lo) works correctly', t => { // hel(la|(lo)+)?
  const trie = new Trie()
  trie.insert(String.raw`hel(lo)`, 1)
  t.deepEqual(trie.match("hello"), {value: 1, match: "hello"})
})

test('Trie hel(lo)?ya works correctly', t => { // hel(la|(lo)+)?
  const trie = new Trie()
  trie.insert(String.raw`hel(lo)?ya`, 1)
  t.deepEqual(trie.match("helya"), {value: 1, match: "helya"})
  t.deepEqual(trie.match("helloya"), {value: 1, match: "helloya"})
})


test.skip('Ascii2Utf8Parser works correctly', t => {
  t.deepEqual(parser.parse("alpha + beta * kappa"), ['α', '+', 'β', '⋅', 'κ'])
  t.deepEqual(parser.parse("beta ** kappa"), ['β', '∗', 'κ'])
  //console.log("parse-result:", parser.parse("sum_(i=1)^n i^3=((n(n+1))/2)^2"))
})
