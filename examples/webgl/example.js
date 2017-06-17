import {merge} from "../../src/creact"
import {Box as BoxGL} from "./BoxGL"
import {Box as BoxThree, Canvas as CanvasThree} from "./BoxThree"
import {Box as BoxX3D} from "./BoxX3D"

document.addEventListener("DOMContentLoaded", function () {
  merge(<CanvasThree width="200" height="200">
    <BoxThree x="10" y="10" z="10"/>
  </CanvasThree>, document.querySelector("#variant2"))
})
