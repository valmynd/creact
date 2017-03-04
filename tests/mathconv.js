import test from "ava"
import {Ascii2Utf8Parser} from "../dist/mathconv/convert"
import {Trie} from "../dist/mathconv/trie"

const parser = new Ascii2Utf8Parser()

test('Trie works correctly', t => {
  const trie = new Trie()
  //trie.insert(String.raw`no\|yes|yey`, 0)
  trie.insert("inf?i?", 1)
  console.log(JSON.stringify(trie.trie))
  //console.log(trie.trie)
  t.true(trie.trie["i"]["n"]["f"]["_v"] === 1)
})

test.skip('Ascii2Utf8Parser works correctly', t => {
  t.deepEqual(parser.parse("alpha + beta * kappa"), ['α', '+', 'β', '⋅', 'κ'])
  t.deepEqual(parser.parse("beta ** kappa"), ['β', '∗', 'κ'])
  //console.log("parse-result:", parser.parse("sum_(i=1)^n i^3=((n(n+1))/2)^2"))
})
