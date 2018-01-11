import {Component, merge} from "../src/creact"
import {render} from "../src/creact_utils"
import {layout} from "./layout";

/**
 * @type{Component[]}
 */
const _layout_queue = []

/**
 * @type{Component[]}
 */
const _merge_queue = []

/**
 *
 */
class TreeComponent extends Component {
  update() {
    let c, n = _layout_queue.push(this)
    if (n === 1) requestAnimationFrame(() => {
      while (c = _layout_queue.shift()) {
        layout(c) // need to make sure, this only happens for the root tree node!
      }
    })
  }
  render({width, height}, children) {
    return <rect ></rect>
  }
}
