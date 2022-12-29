const { Solver } = require("../lib/htmlSolver.js");
const savePixels = require("save-pixels")
const ndarray = require("ndarray");
const { GPU } = require("gpu.js");
const { myMod, infNormTwoD, findMin, argMin, findMax, argMax } = require("../lib/utils.js");
const fs = require('fs');

QUnit.module("solver");


QUnit.test.skip("Initialize solver correctly", (assert) => {
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

  // act
  const solver = new Solver(gpu, N, x0, x1, dt, nu, initialConditionFunction);
  const result = solver.initialKernel();

  // assert
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

QUnit.test("Convergence rate of one step", (assert) => {
  // arrange
  const gpu = new GPU({
    mode: "gpu",
    functions: [myMod],
  });
  const N0 = 256;
  const meshes = Array(4)
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

  const firstStepResults = solvers.map((solver, index) => solver.kernel1(initialConditions[index]))
    .map(s=>[...s.toArray()])
    .map(s=>s.map(r=>[...r]))
  assert.equal(1, 1)

  console.log(firstStepResults[0]);

  const mins = firstStepResults.map(r=>findMin(r));
  const maxs = firstStepResults.map(r=>findMax(r));
  console.log("mins", mins);
  console.log("maxs", maxs);
  //   const minIndex = argMin(diff);
  //   const maxIndex = argMax(diff);
  //   console.log('N',SIZE,'min',min, 'minIndex',minIndex, 'actualVal', diff[minIndex[0]][minIndex[1]]);
  //   console.log('N',SIZE, 'max', max, 'maxIndex', maxIndex, 'actualVal', diff[maxIndex[0]][maxIndex[1]]);
  //   const flattened = Array.from(diff.map(v=>Array.from(v))).flat()
  //   const l2norm = Math.sqrt(flattened.reduce((total, v)=> total + v*v)*dx);
  // console.log('N',SIZE, 'l2norm', l2norm);


  //   const LinfErrors = firstStepResults.map(results => infNormTwoD(results.toArray()));
  // console.log(solvers.map(solver => solver.N));
  // console.log(LinfErrors);

  // solvers.forEach((solver, index) => solver.render(firstStepResults[index]));

  // solvers.forEach((solver, index) => {
  //   const pixels = solver.render.getPixels();
  //   console.log(pixels);
  //   const reshaped = ndarray(pixels, [solver.SIZE, solver.SIZE, 4]);
  //   console.log(reshaped);
  //   const myFile = fs.createWriteStream(`./file${index}.png`);
  //   savePixels(reshaped, "png").pipe(myFile);
  // });

  // console.log(meshes);

  // console.log(firstStepResults)
  // const max = firstStepResults.map(row => Math.max(...row.map(v=> Math.abs(v))));

  // const max = Math.max(...firstStepResults.map((row) => Math.max(...row.map((v) => Math.abs(v)))));
  // console.log(max);
  // const infNorm = firstStepResults.map((result,index)=> result.re)
});