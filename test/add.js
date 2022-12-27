const add = require('../src/add.js');
const { Solver } = require("../src/Solver.js");
const ndarray = require("ndarray");
const { GPU } = require("gpu.js");
const { myMod } = require("../src/utils.js");
QUnit.module('solver');

QUnit.test("Initialize solver correctly", assert => {
  // arrange
  const gpu = new GPU({
    mode: "gpu",
    functions: [myMod]
  });
  const N = 4;
  const x0 = 0.0;
  const x1 = 1.0;
  
  const initialConditionFunction = function () {
    const xIndex = this.thread.x;
    const yIndex = this.thread.y;
    const N = this.constants.SIZE;
    const x0 = this.constants.X0;
    const x1 = this.constants.X1;
    const x = xIndex / (N - 1) * (x1 - x0)
    const y = yIndex / (N - 1) * (x1 - x0)
    return Math.sin(x * Math.PI / 2) * Math.sin(y * Math.PI / 2)
  }

  // act
  const solver = new Solver(gpu, N, x0, x1, initialConditionFunction);
  const result = solver.initialKernel();

  // assert
  result.toArray().forEach((row, yIndex) => row.forEach((val, xIndex) => {
    const x = xIndex / (N - 1) * (x1 - x0);
    const y = yIndex / (N - 1) * (x1 - x0);
    const reference = Math.sin(x * Math.PI / 2) * Math.sin(y * Math.PI / 2);
    assert.true(Math.abs(reference - val) < 1e-5, `ref ${reference} = ${val} val? at xIndex,yIndex=${xIndex},${yIndex} `);
  }))

})