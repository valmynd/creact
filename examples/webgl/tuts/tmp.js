//Canvas handles
let can1 = null;
let can2 = null;
let can3 = null;
//Canvas contexts
let ctx1 = null;
let ctx2 = null;
let ctx3 = null;
//letiables
window.onload = initialize;

function initialize() {
  can1 = document.getElementById('can1');
  try {
    ctx1 = can1.getContext('2d');
  } catch (e) {
  }
  can2 = document.getElementById('can2');
  try {
    ctx2 = can2.getContext('2d');
  } catch (e) {
  }
  can3 = document.getElementById('can3');
  try {
    ctx3 = can3.getContext('2d');
  } catch (e) {
  }
  reGridCalculate();
  drawOnCanvas1();
  drawOnCanvas2();
  drawOnCanvas3();
  initialize3D();
}
function drawOnCanvas1() {
  ctx1.clearRect(0, 0, can1.width, can1.height);
  drawGrid(ctx1, 4, 1);

  drawText("Figure 1 :   A simple grid with 8 vertices.", 100, 240, ctx1, "black", "12pt sans-serif", 1);
  drawText("gl.drawArrays ( gl.TRIANGLE, 0, numVertices)", 100, 260, ctx1, "black", "12pt sans-serif", 1);
  drawText("requires 18 sets of x,y,z position values", 100, 280, ctx1, "black", "12pt sans-serif", 1);
}
function drawOnCanvas2() {
  ctx2.clearRect(0, 0, can2.width, can2.height);
  drawGrid(ctx2, 4, 1);

  drawText("Figure 2 :   A simple grid with 8 vertices.", 100, 240, ctx2, "black", "12pt sans-serif", 1);
  drawText("gl.drawArrays ( gl.TRIANGLE_STRIP, 0, numVertices)", 100, 260, ctx2, "black", "12pt sans-serif", 1);
  drawText("requires only 8 sets of x,y,z position values", 100, 280, ctx2, "black", "12pt sans-serif", 1);
}
function drawOnCanvas3() {
  ctx3.clearRect(0, 0, can3.width, can3.height);
  drawGrid(ctx3, 4, 2);

  drawText("Figure 3 :   A simple grid with 12 vertices.", 100, 340, ctx3, "black", "12pt sans-serif", 1);
  drawText("gl.drawArrays ( gl.TRIANGLE_STRIP, 0, numVertices)", 100, 360, ctx3, "black", "12pt sans-serif", 1);
  drawText("requires only 14 sets of x,y,z position values", 100, 380, ctx3, "black", "12pt sans-serif", 1);
  drawText("Note: Using TRIANGLES we would have to specify 36", 100, 420, ctx3, "black", "12pt sans-serif", 1);
  drawText("           sets of x,y,z position values", 100, 440, ctx3, "black", "12pt sans-serif", 1);
}
function drawGrid(zctx, cols, rows) {
  let i = 0;
  zctx.beginPath();
  zctx.strokeStyle = "black";
  zctx.lineWidth = 4;
  for (i = 1; i < cols; i++) {
    zctx.moveTo(i * 100, 100);		//top left
    zctx.lineTo(i * 100 + 100, 100); //topright
    zctx.lineTo(i * 100 + 100, 200); //bottom right
    zctx.lineTo(i * 100, 200);			//bottom left
    zctx.lineTo(i * 100, 100);			////top left
    if (rows > 1) {
      zctx.moveTo(i * 100, 200);		//top left
      zctx.lineTo(i * 100 + 100, 200); //topright
      zctx.lineTo(i * 100 + 100, 300); //bottom right
      zctx.lineTo(i * 100, 300);			//bottom left
      zctx.lineTo(i * 100, 200);			////top left
    }
  }
  zctx.stroke();
  zctx.beginPath();
  zctx.strokeStyle = "red";
  zctx.lineWidth = 4;
  for (i = 1; i < cols; i++) {
    zctx.moveTo(i * 100, 200);			//bottom left
    zctx.lineTo(i * 100 + 100, 100); //topright
    if (rows > 1) {
      zctx.moveTo(i * 100, 300);			//bottom left
      zctx.lineTo(i * 100 + 100, 200); //topright
    }
  }
  zctx.stroke();
  zctx.beginPath();
  zctx.strokeStyle = "lightblue";
  if (rows > 1) {
    zctx.moveTo(400, 100);
    zctx.lineTo(100, 200);
    zctx.lineTo(400, 200);
    zctx.lineTo(400, 100);

    zctx.lineTo(100, 200);
    zctx.lineTo(100, 300);
    zctx.lineTo(400, 200);

  }
  zctx.stroke();
  let radius = 20;
  zctx.fillStyle = 'white';
  zctx.lineWidth = 2;
  zctx.strokeStyle = 'black'//'#003300';
  zctx.font = '12pt sans-serif';
  for (i = 1; i <= cols; i++) {
    zctx.beginPath();
    zctx.arc(i * 100, 100, radius, 0, 2 * Math.PI, false);
    zctx.fill();
    zctx.strokeText(i, i * 100 - 5, 100 + 5);
    zctx.stroke();
    zctx.beginPath();
    zctx.arc(i * 100, 200, radius, 0, 2 * Math.PI, false);
    zctx.fill();
    zctx.strokeText(i + cols, i * 100 - 5, 200 + 5);
    zctx.stroke();
    if (rows > 1) {
      zctx.beginPath();
      zctx.arc(i * 100, 300, radius, 0, 2 * Math.PI, false);
      zctx.fill();
      zctx.strokeText(i + 2 * cols, i * 100 - 5, 300 + 5);
      zctx.stroke();
    }
  }
}
function drawText(text, x, y, canvas, color, font, linewidth) {
  canvas.font = font;
  canvas.lineWidth = 1;
  canvas.strokeStyle = color;
  canvas.strokeText(text, x, y);
}
function reGridCalculate() {
  let gCols = parseInt(document.gridData.xgridcols.value);
  let gRows = parseInt(document.gridData.xgridrows.value);
  document.gridData.numVert.value = gCols * gRows;
  document.gridData.numTri.value = 2 * ( gCols - 1) * (gRows - 1);
  document.gridData.numTVert.value = 3 * 2 * ( gCols - 1) * (gRows - 1);
  document.gridData.numTSVert.value = 2 * gCols * (gRows - 1) + 2 * (gRows - 2);
}

let perspective = 0;
let can3D = null;
let cols = 240, rows = 18;
let rotateDegrees = 0.1;
let rotX = 1, rotY = 1, rotZ = 0;
let gx, gy;
let x, y, z;
let gheight;
let gl = null;
let program = null;
let verticeBufferObject = null;
let verticeColorBufferObject = null;
let triangleStripArray = new Array();
let totverticesTS = 0;
let vertexShader = null;
let fragmentShader = null;
let numVertices = 0;
function initialize3D() {
  initialize3DCanvas();
  calculateValues();
  initializeModels();
  initializeShaders();
  initializeProgram();
  render();
}
function initialize3DCanvas() {
  can3D = document.getElementById('canvas3D');
  gl = can3D.getContext("webgl") || can3D.getContext('experimental-webgl');
  if (gl) {
    gl.viewportWidth = can3D.width;
    gl.viewportHeight = can3D.height;
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clearColor(0.5, 0.5, 0.5, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    can3D.addEventListener('mouseover', canvasFocus, false);
    can3D.addEventListener('mouseout', canvasUnFocus, false);
    can3D.addEventListener('mousedown', handlemousedown, false);
    can3D.addEventListener('mouseup', handlemouseup, false);
    can3D.addEventListener('mousemove', handlemousemove, false);
    can3D.setAttribute('tabindex', '0');
  }
  if (perspective) {
    gx = 0.5;
    gy = 6;
    x = -1 * cols * gx / 2;
    y = -1 * rows * gy / 2;
    z = -1 * cols;
    gheight = 15;
  }
  else {
    gx = 4;
    gy = 48;
    x = -1 * cols * gx / 2;
    y = -1 * rows * gy / 2;
    z = -2 * cols;
    gheight = 30;
  }
}
let keplerData = new Array(4370);
let avgArray = new Array(4370);
let zzTop = new Array(4370);
function calculateValues() {
  let i = 0;
  let j = 0;
  let total = 0;
  let alpha = .2;
  let range = 0;
  let g_min = 0;
  let g_max = 0;
  let avg = 0;
  for (i = 2; i <= 13110; i += 3) {
    //Get the flux values
    //"55093","223445","82962110",
    //"55093","243878","82940544",
    keplerData[j] = parseInt(rawKeplerData[i]);
    total += keplerData[j];
    j++;
  }
  avg = parseInt(total / 4370);
  g_max = Math.max.apply(null, keplerData);
  g_min = Math.min.apply(null, keplerData);
  range = g_max - g_min;
  avgArray[0] = avg;
  zzTop[0] = 0.0;
  for (i = 1; i < 4370; i++) {
    avgArray[i] = alpha * keplerData[i] + (1 - alpha) * avgArray[i - 1];
    zzTop[i] = (keplerData[i] - avgArray[i] ) / 550;
  }
}
let vertixx = new Float32Array(rows * cols);
let vertixy = new Float32Array(rows * cols);
let vertixz = new Float32Array(rows * cols);
function initializeModels() {

  let i = 0, j = 0;
  let index = 0;
  let totverticesRC = 2 * cols * (rows - 1);
  let totverticesTS = 2 * cols * (rows - 1) + 2 * (rows - 2);
  let verticeArray = new Float32Array(3 * totverticesTS);//42);
  let verticeColorArray = new Float32Array(4 * totverticesTS);
  numVertices = totverticesTS;
  for (let row = 1; row <= rows; row++)
    for (let col = 1; col <= cols; col++) {
      vertixx[j] = gx * col;
      vertixy[j] = gy * row;
      if (zzTop[j] > 0) vertixz[j] = 0.0;
      else if (perspective) vertixz[j] = -1 * zzTop[j];
      else  vertixz[j] = -2 * zzTop[j];
      j++;
    }
  j = 0;
  for (i = 1; i <= totverticesRC; i += 2) {
    triangleStripArray[j] = (1 + i) / 2;  //ODD
    triangleStripArray[j + 1] = (cols * 2 + i + 1) / 2;//EVEN
    if (triangleStripArray[j + 1] % cols == 0) //check for end of col
    {
      if (triangleStripArray[j + 1] != cols && triangleStripArray[j + 1] != cols * rows) {
        triangleStripArray[j + 2] = triangleStripArray[j + 1];
        triangleStripArray[j + 3] = (1 + i + 2) / 2;
        j += 2;
      }
    }
    j += 2;
  }
  let k = 0, n = 0;
  j = 0;
  for (i = 0; i < triangleStripArray.length; i++) {
    index = triangleStripArray[j];
    j++;

    verticeArray[k++] = vertixx[index - 1];
    verticeArray[k++] = vertixy[index - 1];
    verticeArray[k++] = vertixz[index - 1];
    if (vertixz[index - 1] >= gheight) {
      verticeColorArray[n++] = 0.0;
      verticeColorArray[n++] = 0.0;
      verticeColorArray[n++] = 1.0;
    }
    else {
      verticeColorArray[n++] = 1.0;
      verticeColorArray[n++] = 0.0;
      verticeColorArray[n++] = 0.0;
    }
    verticeColorArray[n++] = 1.0;
  }
  verticeBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, verticeBufferObject);
  gl.bufferData(gl.ARRAY_BUFFER, verticeArray, gl.STATIC_DRAW);

  verticeColorBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, verticeColorBufferObject);
  gl.bufferData(gl.ARRAY_BUFFER, verticeColorArray, gl.STATIC_DRAW);

}

function initializeShaders() {
  let vertexShaderCode =
    'attribute vec3 aVertexPosition;' +
    'attribute vec4 aVertexColor;' +
    'uniform mat4 uMVMatrix;' +
    'uniform mat4 uPMatrix;' +
    'varying lowp vec4 vertexColor;' +
    'void main(void)' +
    '{' +
    'gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);' +
    'vertexColor = aVertexColor;' +
    '}';
  vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderCode);
  gl.compileShader(vertexShader);
  let fragmentShaderCode =
    'varying lowp vec4 vertexColor;' +
    'void main(void)' +
    '{' +
    'gl_FragColor = vertexColor;' +
    '}';
  fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderCode);
  gl.compileShader(fragmentShader);
}

function initializeProgram() {
  program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.useProgram(program);
  program.vertexPositionAttribute = gl.getAttribLocation(program, "aVertexPosition");
  gl.enableVertexAttribArray(program.vertexPositionAttribute);
  program.vertexColorAttribute = gl.getAttribLocation(program, "aVertexColor");
  gl.enableVertexAttribArray(program.vertexColorAttribute);
  program.pMatrixUniform = gl.getUniformLocation(program, "uPMatrix");
  program.mvMatrixUniform = gl.getUniformLocation(program, "uMVMatrix");
}

let mvMatrix = mat4.create();
let pMatrix = mat4.create();

let verticesize = 3, fps = 15;
let posneg = 1;
function render() {
  window.requestAnimFrame(render);
  rotX = 1;
  rotY = 1;
  rotZ = 0;
  if (perspective) {
    mat4.perspective(pMatrix, 45 * Math.PI / 180, gl.viewportWidth / gl.viewportHeight, 0.1, 1000.0);
  }
  else {
    mat4.ortho(pMatrix, -gl.viewportWidth, gl.viewportWidth, -gl.viewportHeight, gl.viewportHeight, 0.1, 1000.0);//-5000, 5000);
  }


  mat4.identity(mvMatrix);
  mat4.translate(mvMatrix, mvMatrix, [x, y, z]);
  mat4.rotate(mvMatrix, mvMatrix, rotateDegrees * Math.PI / 180, [rotX, rotY, rotZ]);
  gl.bindBuffer(gl.ARRAY_BUFFER, verticeBufferObject);
  gl.vertexAttribPointer(program.vertexPositionAttribute, verticesize, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, verticeColorBufferObject);
  gl.vertexAttribPointer(program.vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);
  gl.uniformMatrix4fv(program.pMatrixUniform, false, pMatrix);
  gl.uniformMatrix4fv(program.mvMatrixUniform, false, mvMatrix);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, numVertices);

  //setTimeout("render()",1000/fps);
}
window.requestAnimFrame = (function () {
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback) {
      window.setTimeout(callback, 1000 / fps);
    };
})();

let mousedown = 0;
let oldY = 0, oldX = 0;
function canvasFocus() {
  can3D.focus();
  oldX = event.clientX;
  oldY = event.clientY;
  return false;
}
function canvasUnFocus() {
  can3D.blur();
  return false;
}
function handlemousedown(event) {
  mousedown = 1;
  return false;
}
function handlemouseup() {
  mousedown = 0;
  return false;
}
let changeX = 0;
let changeY = 0;
function handlemousemove(event) {
  if (!mousedown)   return;
  rotX = 0;
  rotY = 0;
  changeX = event.clientX - oldX;
  changeY = event.clientY - oldY;
  oldX = event.clientX;
  oldY = event.clientY;
  if (changeX != 0) rotX = 1;
  if (changeY != 0) rotY = 1;
  if (changeX >= 0) rotateDegrees += 1;
  else rotateDegrees -= 1;
}

