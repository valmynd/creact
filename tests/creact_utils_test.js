import test from "ava"
import {equals} from "../dist/creact_utils";
import {example} from "../dist/examples/tree_example"

test('equals works correctly', t => {
  t.is(equals([], []), true)
})

console.log(JSON.stringify(example))
console.log(JSON.stringify(example.tag))
