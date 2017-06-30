import {Component} from '../../src/creact'
import {compileShaders} from "./utils/webgl_utils"
// https://webgl2fundamentals.org/webgl/lessons/webgl-fundamentals.html

export class Canvas extends Component {
  componentDidMount() {
    let gl = this._element.getContext("webgl2")
    let program = compileShaders(gl)
    let positionAttributeLocation = gl.getAttribLocation(program, "position")
    let colorAttributeLocation = gl.getAttribLocation(program, "color")
    //console.log({positionAttributeLocation, colorAttributeLocation})
    // put data in a buffer
    let positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    let dimension = 2 // 2d
    let positions = [
      1, 1, // begin first triangle
      1, -1,
      -1, -1, // end first triangle
      -1, -1,
      -1, 1,
      1, 1
    ]
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)
    // tell the attribute how to get data out of it
    let vao = gl.createVertexArray()
    gl.bindVertexArray(vao)
    gl.enableVertexAttribArray(positionAttributeLocation)
    gl.vertexAttribPointer(positionAttributeLocation, dimension, gl.FLOAT, false, 0, 0)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.useProgram(program)
    gl.drawArrays(gl.TRIANGLES, 0, positions.length / dimension)
  }

  render({width = 100, height = 100}, children = []) {
    return <canvas width={width} height={height}>
    </canvas>
  }
}

export class Box extends Component {
  render(attributes = {}, children = []) {

  }
}
