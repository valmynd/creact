import {Component} from '../../src/creact'
import {compileShaders} from "./webgl_utils"
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
    let positions = [
      0, 0, // begin first triangle
      0, 0.5,
      0.9, 0, // end first triangle
      0.4, 1,
      0.1, 0.5,
      1, 0
    ]
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)
    // tell the attribute how to get data out of it
    let vao = gl.createVertexArray()
    gl.bindVertexArray(vao)
    gl.enableVertexAttribArray(positionAttributeLocation)
    let size = 2          // 2 components per iteration
    let type = gl.FLOAT   // the data is 32bit floats
    let normalize = false // don't normalize the data
    let stride = 0        // 0 = move forward size * sizeof(type) each iteration to get the next position
    let offset = 0        // start at the beginning of the buffer
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.useProgram(program)
    gl.drawArrays(gl.TRIANGLES, offset, positions.length / size)
  }

  render({width = 100, height = 100}, children = []) {
    return <canvas width={width} height={height} style="background:black;">
    </canvas>
  }
}

export class Box extends Component {
  render(attributes = {}, children = []) {

  }
}
