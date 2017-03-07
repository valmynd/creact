import test from "ava"
import {Ascii2Utf8Parser} from "../dist/mathconv/convert"

const parser = new Ascii2Utf8Parser()
const str = o => JSON.stringify(o)
const r = String.raw

test('Ascii2Utf8Parser works', t => {
  //console.log(parser.parse("alpha"))
  //t.deepEqual(parser.parse("alpha + beta * kappa"), ['α', '+', 'β', '⋅', 'κ'])
  //t.deepEqual(parser.parse("beta ** kappa"), ['β', '∗', 'κ'])
  //console.log("parse-result:", parser.parse("sum_(i=1)^n i^3=((n(n+1))/2)^2"))
})
