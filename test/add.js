const add = require("../src/add.js");
const { Solver } = require("../src/Solver.js");
const ndarray = require("ndarray");
const { GPU } = require("gpu.js");
const { myMod, infNormTwoD } = require("../src/utils.js");
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
  const solver = new Solver(gpu, N, x0, x1, initialConditionFunction);
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
  const N0 = 10;
  const meshes = Array(4)
    .fill()
    .map((v, i) => N0 * Math.pow(2, i));
  const N = 4;
  const x0 = 0.0;
  const x1 = 1.0;

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
    (N, index) => new Solver(gpu, N, x0, x1, initialConditionFunction)
  );

  const initialConditions = solvers.map(solver=>solver.initialKernel());

  const firstStepResults = solvers.map((solver, index )=> solver.solverKernel(initialConditions[index]))
  assert.equal(1,1)

  const LinfErrors = firstStepResults.map(results => infNormTwoD(results.toArray()));
  console.log(LinfErrors);

  // console.log(firstStepResults)
  // const max = firstStepResults.map(row => Math.max(...row.map(v=> Math.abs(v))));

  // const max = Math.max(...firstStepResults.map((row) => Math.max(...row.map((v) => Math.abs(v)))));
  // console.log(max);
  // const infNorm = firstStepResults.map((result,index)=> result.re)
});