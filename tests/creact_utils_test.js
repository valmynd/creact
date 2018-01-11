import test from "ava"
import {equals, render} from "../dist/creact_utils"
import {example} from "../dist/examples/tree_example"
import {instantiate} from "../dist/creact_utils";

test('equals works correctly', t => {
  t.is(equals([], []), true)
})

console.log(JSON.stringify(example))
let c = instantiate(example)
console.log(JSON.stringify(c))
console.log("render:\n",JSON.stringify(render(c)))
