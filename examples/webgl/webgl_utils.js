/**
 * Create a program from a vertex- ańd a fragment-shader
 * @param {WebGLRenderingContext} gl
 * @param {string} vertexShader
 * @param {string} fragmentShader
 * @return {WebGLProgram}
 */
export function compileShaders(gl, vertexShader = defaultVertexShader, fragmentShader = defaultFragmentShader) {
  let shader, success, program = gl.createProgram()
  // Vertex Shader
  shader = gl.createShader(gl.VERTEX_SHADER)
  gl.shaderSource(shader, vertexShader.trim())
  gl.compileShader(shader)
  success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  if (!success) throw "vertexShader failed to compile: " + gl.getShaderInfoLog(shader)
  gl.attachShader(program, shader)
  // Fragment Shader
  shader = gl.createShader(gl.FRAGMENT_SHADER)
  gl.shaderSource(shader, fragmentShader.trim())
  gl.compileShader(shader)
  success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  if (!success) throw "fragmentShader failed to compile: " + gl.getShaderInfoLog(shader)
  gl.attachShader(program, shader)
  // Program
  gl.linkProgram(program)
  success = gl.getProgramParameter(program, gl.LINK_STATUS)
  if (!success) throw ("program failed to link: " + gl.getProgramInfoLog(program))
  return program
}


export const defaultVertexShader = `
#version 300 es
in vec4 color;
in vec4 position;
out vec4 iColor;
void main() {
  iColor = position * 0.5 + 0.5; // convert from clipspace (goes from -1.0 to +1.0) to colorspace (from 0.0 to 1.0)
  gl_Position = position;
}
`

export const defaultFragmentShader = `
#version 300 es
precision mediump float;
in vec4 iColor;
out vec4 color;
void main() {
  color = iColor;
}
`
