import test from "ava"
import {Ascii2Utf8Parser} from "../dist/mathconv/convert"
import {Trie} from "../dist/mathconv/trie"

const parser = new Ascii2Utf8Parser()

test('Trie works correctly', t => {
  const trie = new Trie()
  trie.insert(0, "frosch")
  trie.insert(1, "frisch")
  trie.insert(2, "fr")
  trie.insert(3, "frischerfisch")
  trie.insert(4, "frosch")
  console.log(JSON.stringify(trie.trie))
  //console.log(trie.trie)
})

test('Ascii2Utf8Parser works correctly', t => {
  console.log("parse-result:", parser.parse("alpha + beta * kappa"), "vs.", parser.parse("beta ** kappa"))
})
