import {Component, merge} from "../creact"
import {render} from "../creact_utils"
import {layout} from "./layout"

/**
 *
 */
export class Tree extends Component {
  render({width, height}, children) {
    this._bb = [[0,0], [width, height]]
    return <rect/>
  }
}
