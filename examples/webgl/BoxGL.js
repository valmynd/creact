import {Component} from '../../src/creact'

export class Canvas extends Component {
  render({width = 100, height = 100}, children = []) {
    return <canvas width={width} height={height}>
    </canvas>
  }
}

export class Box extends Component {
  render(attributes = {}, children = []) {

  }
}
