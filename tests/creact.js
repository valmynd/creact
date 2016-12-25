import test from "ava"
import {
  h,
  create,
  merge,
  Component
} from "../dist/creact";

test('h works correctly', t => {
  t.deepEqual(h("div", {}), {tag: "div", attributes: {}, children: undefined})
})
