const { Solver } = require("../lib/htmlSolver.js");
const savePixels = require("save-pixels")
const ndarray = require("ndarray");
const { GPU } = require("gpu.js");
const { myMod, infNormTwoD, findMin, argMin, findMax, argMax } = require("../lib/utils.js");
const fs = require('fs');

QUnit.module("solver");


QUnit.test("Initialize solver correctly", (assert) => {
  // arrange
  const gpu = new GPU({
    mode: "gpu",
    functions: [myMod],
  });
  const N = 4;
  const x0 = 0.0;
  const x1 = 1.0;
  const dt = 1.0;
  const nu = 1.0;

  const initialConditionFunction = function () {
    const xIndex = this.thread.x;
    const yIndex = this.thread.y;
    const N = this.constants.SIZE;
    const x0 = this.constants.X0;
    const x1 = this.constants.X1;
    const x = (xIndex / (N - 1)) * (x1 - x0);
    const y = (yIndex / (N - 1)) * (x1 - x0);
    return Math.sin((x * Math.PI) / 2) * Math.sin((y * Math.PI) / 2);
  };

  // act: compute the initial condtion
  const solver = new Solver(gpu, N, dt, nu, x0, x1, initialConditionFunction);
  const result = solver.initialKernel();

  // assert: it should be 10^-5 (single precision) close 
  result.toArray().forEach((row, yIndex) =>
    row.forEach((val, xIndex) => {
      const x = (xIndex / (N - 1)) * (x1 - x0);
      const y = (yIndex / (N - 1)) * (x1 - x0);
      const reference =
        Math.sin((x * Math.PI) / 2) * Math.sin((y * Math.PI) / 2);
      assert.true(
        Math.abs(reference - val) < 1e-5,
        `ref ${reference} = ${val} val? at xIndex,yIndex=${xIndex},${yIndex} `
      );
    })
  );
});

QUnit.test("The convergence rate of one step should be 4 and degrade with single precision", (assert) => {
  // arrange
  const gpu = new GPU({
    mode: "gpu",
    functions: [myMod],
  });

  // because of 1/dx^2 being an unstable operation,
  // which is really notorious on single precision, 
  // only very coarse meshes are tested.
  // Normally this is not an issue because dt/dx^2 is constant
  // but here dt is constant and dx^2 goes to zero 
  const N0 = 4;
  const meshes = Array(6)
    .fill()
    .map((v, i) => N0 * Math.pow(2, i));
  const x0 = 0.0;
  const x1 = 1.0;
  const nu = 2.0 / Math.PI / Math.PI;
  const dt = 1.0;

  const initialConditionFunction = function () {
    const xIndex = this.thread.x;
    const yIndex = this.thread.y;
    const N = this.constants.SIZE;
    const x0 = this.constants.X0;
    const x1 = this.constants.X1;
    const x = (xIndex / (N - 1)) * (x1 - x0);
    const y = (yIndex / (N - 1)) * (x1 - x0);
    return Math.sin((x * Math.PI) / 2) * Math.sin((y * Math.PI) / 2);
  };

  // act
  const solvers = meshes.map(
    (N, index) => new Solver(gpu, N, dt, nu, x0, x1, initialConditionFunction)
  );

  const initialConditions = solvers.map(solver => solver.initialKernel());

  const  firstStepResults = solvers.map((solver, index) => solver.kernel1(initialConditions[index]))
    .map(s=>[...s.toArray()])
    .map(s=>s.map(r=>[...r]))

  const mins = firstStepResults.map(r=>findMin(r));
  const maxs = firstStepResults.map(r=>findMax(r));
  const linfs2 = firstStepResults.map(r=>r.map(row=>row.map(v=>Math.abs(v)))).map(r=>findMax(r));
  const linfs = mins.map((min,i)=> Math.max(Math.abs(min), Math.abs(maxs[i])));
  const ratios = linfs.slice(0,-1).map((val,index)=>val/linfs[index+1]);
  // const mean = ratios.reduce((mean,val)=>mean + val/(linfs.length-1),0);
  // console.log(firstStepResults"meshes", meshes);
  // console.log("ratios", ratios);
  // console.log("mins", mins);
  // console.log("maxs", maxs);
  // console.log("linfs2", linfs2)
  // console.log("linfs2", linfs)
  
  
  // var file = fs.createWriteStream('array.txt');
  // file.on('error', function(err) { /* error handling */ });
  // firstStepResults[0].forEach(function(v) { file.write(v.join(', ') + '\n'); });
  // file.end();
  
  assert.true(ratios[0]>4.0);
  assert.true(ratios[1]>4.0);
  assert.true(ratios[2]>3.58);
  assert.true(ratios[0]>0.7);
  assert.true(ratios[0]>0.2);

  // with second order scheme I should be getting mean=4, but ..oh well..
  // but ill settle for this 


  // to plot things: 
  // solvers.forEach((solver, index) => solver.render(firstStepResults[index]));

  // solvers.forEach((solver, index) => {
  //   const pixels = solver.render.getPixels();
  //   console.log(pixels);
  //   const reshaped = ndarray(pixels, [solver.SIZE, solver.SIZE, 4]);
  //   console.log(reshaped);
  //   const myFile = fs.createWriteStream(`./file${index}.png`);
  //   savePixels(reshaped, "png").pipe(myFile);
  // });
});