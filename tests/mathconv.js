import test from "ava"
import {Ascii2Utf8Parser} from "../dist/mathconv/convert"
import {Trie} from "../dist/mathconv/trie"

const parser = new Ascii2Utf8Parser()

test('Trie inf+i works correctly', t => {
  const trie = new Trie()
  trie.insert(String.raw`no\|yes|yey`, 0)
  //console.log(JSON.stringify(trie.trie))
  t.true(trie.trie["n"]["o"]["|"]["y"]["e"]["s"]["_v"] === 0)
  t.true(trie.trie["y"]["e"]["y"]["_v"] === 0)
})


test('Trie inf+i works correctly', t => {
  const trie = new Trie()
  trie.insert("inf+i", 1)
  t.true(trie.trie["i"]["n"]["f"]["f"]["i"]["_v"] === 1)
})


test('Trie infi?n?y works correctly', t => {
  const trie = new Trie()
  trie.insert("infi?n?y", 1)
  //console.log(JSON.stringify(trie.trie))
  //console.log(trie.trie)
  t.true(trie.trie["i"]["n"]["f"]["y"]["_v"] === 1)
  t.true(trie.trie["i"]["n"]["f"]["n"]["y"]["_v"] === 1)
})
test('Trie epsil?o?n? works correctly', t => {
  const trie = new Trie()
  trie.insert("epsil?o?n?", 1)
  t.true(trie.trie["e"]["p"]["s"]["i"]["_v"] === 1)
  t.true(trie.trie["e"]["p"]["s"]["i"]["l"]["_v"]=== 1)
  t.true(trie.trie["e"]["p"]["s"]["i"]["n"]["_v"]=== 1)
  t.true(trie.trie["e"]["p"]["s"]["i"]["l"]["o"]["_v"]=== 1)
  trie.insert(String.raw`epsi\?l?o?n?`, 1)
  t.true(trie.trie["e"]["p"]["s"]["i"]["?"]["_v"] === 1)
  trie.insert(String.raw`epsi\\?l?o?n?`, 1)
  t.true(trie.trie["e"]["p"]["s"]["i"]["\\"]["?"]["_v"] === 1)
  //console.log(JSON.stringify(trie.trie))
})

test.skip('Ascii2Utf8Parser works correctly', t => {
  t.deepEqual(parser.parse("alpha + beta * kappa"), ['α', '+', 'β', '⋅', 'κ'])
  t.deepEqual(parser.parse("beta ** kappa"), ['β', '∗', 'κ'])
  //console.log("parse-result:", parser.parse("sum_(i=1)^n i^3=((n(n+1))/2)^2"))
})
