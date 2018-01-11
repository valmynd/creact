import test from "ava"
import {
  equals,
  removeDomNode,
  replaceDomNode,
  instantiate,
  link,
  render,
  setListener,
  removeListener
} from "../dist/creact_utils";

test('equals works correctly', t => {
  t.is(equals([], []), true)
})
