import test from "ava"
import {Component, create, merge} from "../dist/creact"
import {example} from "../dist/examples/tree_example"

test('todo: more tests', t => {
  t.is(1, 1)
})

print("create:\n", create(example))
