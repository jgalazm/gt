const add = require('../src/add.js');
const { Solver } = require("../src/Solver.js");
const ndarray = require("ndarray");
const { GPU } = require("gpu.js");
const { myMod } = require("../src/utils.js");
QUnit.module('solver');

QUnit.test("Initialize solver correctly", assert => {
  // initial condition and parameters
  // const initialCondition = (x,y) => { 
  //   return Math.sin(x * Math.PI / 2) * Math.sin(y * Math.PI / 2)
  // };

  const gpu = new GPU({
    mode: "gpu",
    functions: [myMod]
  });
  const N = 4;
  const x0 = 0.0;
  const x1 = 1.0;
  const solver = new Solver(gpu, N, x0, x1);
  const result = solver.initialKernel();
  result.toArray().forEach((row, yIndex) => row.forEach((val, xIndex) => {
    const x = xIndex / (N - 1) * (x1 - x0);
    const y = yIndex / (N - 1) * (x1 - x0);
    const reference = Math.sin(x * Math.PI / 2) * Math.sin(y * Math.PI / 2);
    assert.true(Math.abs(reference - val) < 1e-5, `ref ${reference} = ${val} val? at xIndex,yIndex=${xIndex},${yIndex} `);
  }))

})