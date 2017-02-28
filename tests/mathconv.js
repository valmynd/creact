import test from "ava"
import {
  Ascii2Utf8Parser
} from "../dist/mathconv/convert"

const parser = new Ascii2Utf8Parser()

test('h works correctly', t => {
  console.log("parse-result:", parser.parse("alpha * kappa"))
})
