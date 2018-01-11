import test from "ava"
import {Component, create, renderToString} from "../dist/creact"
import {example} from "../dist/examples/tree_example"

test('renderToString do the same thing', t => {
  t.true(create(example).outerHTML === renderToString(example))
  t.true(renderToString(example) === create(example).outerHTML)
})

console.log("compare:\n", create(example).outerHTML, "\n", renderToString(example))
