import test from "ava"
import {h, instantiate, render, renderToString} from "../dist/creact_utils"
import {example} from "../dist/examples/tree_example"

test('h works correctly', t => {
  t.deepEqual(h("div", {}), {tag: "div", attributes: {}, children: []})
})

//console.log(JSON.stringify(example))
let c = instantiate(example)
//console.log(JSON.stringify(c))
let vn = render(c)
//console.log("render:\n", JSON.stringify(vn))
let str = renderToString(vn)
print("str:\n", str)
