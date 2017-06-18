import {merge} from "../../src/creact"
import {Box as BoxGL, Canvas as CanvasGL} from "./BoxGL"
import {Box as BoxThree, Canvas as CanvasThree} from "./BoxThree"
import {Box as BoxX3D} from "./BoxX3D"

document.addEventListener("DOMContentLoaded", function () {
  merge(<CanvasGL width="200" height="200">
    <BoxGL x="10" y="10" z="10"/>
  </CanvasGL>, document.querySelector("#variant1"))
  merge(<CanvasThree width="200" height="200">
    <BoxThree x="10" y="10" z="10"/>
  </CanvasThree>, document.querySelector("#variant2"))
})
