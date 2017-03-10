import test from "ava"
import CircularJSON from "circular-json"
import {Trie} from "../dist/mathconv/trie"

const str = o => CircularJSON.stringify(o)
const r = String.raw

import a from "../dist/mathconv/asciimath"
//console.log("asciimath:", str(a))


test.skip('Trie expressions work', t => {
  let trie = new Trie()
  trie.define("WS", "[ \t\r\n\f]")
  trie.define("PM", "+|-")
  trie.define("MD", "*|/")
  trie.define("Variable", "[a-e]")
  trie.define("Expression", "{Variable}|{Additive}|{Multiplicative}")
  trie.defineBinaryLeftAssociative(1, "Additive", "{left:Expression}{WS}*{operator:PM}{WS}*{right:Expression}")
  trie.defineBinaryLeftAssociative(2, "Multiplicative", "{left:Expression}{WS}*{operator:PM}{WS}*{right:Expression}")
  trie.insert("{Expression}", 1)
  console.log("a+b", trie.match("a+b"))
  console.log(str(trie))
})
