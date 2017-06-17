import {Component} from '../../src/creact'
import BoxGeometry from 'three'


export class Canvas extends Component {
  render({width = 100, height = 100}, children = []) {
    for (let child of children) {
      if (child.tag === Box) {
        let box = new BoxGeometry(10, 10, 10, 10, 10, 10)
      }
    }
    return <canvas width={width} height={height}>
    </canvas>
  }
}

export class Box extends Component {
  render(attributes = {}, children = []) {

  }
}
