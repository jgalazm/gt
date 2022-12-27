const { GPU } = require("gpu.js");
const { Solver } = require("./Solver.js")
// function myMod(x, y) {
//     return y * (x / y - Math.floor(x / y));
// }
const {myMod} = require("./utils");
console.log(myMod);
const gpu = new GPU({
    mode: "gpu",
    functions: [myMod]
});


const N = 512;
const solver = new Solver(gpu, N, 0.0, 1.0);


const initialResult = solver.initialKernel();
solver.render(initialResult);
const pixels = solver.render.getPixels();
const savePixels = require("save-pixels")
const ndarray = require("ndarray");
const reshaped = ndarray(pixels, [N,N,4]);
savePixels(reshaped, "png").pipe(process.stdout)

// const firstStepResult = solverKernel(initialResult);

// const solverKernel = gpu
//     .createKernel(function (texture) {
//         const x = this.thread.x;
//         const y = this.thread.y;
//         const SIZE = this.constants.SIZE;
//         const dx = 1 / this.constants.SIZE;
//         const dt = 0.2 * dx * dx;
//         const iminus = Math.floor(myMod(x - 1, SIZE));
//         const jminus = Math.floor(myMod(y - 1, SIZE));
//         const iplus = Math.floor(myMod(x + 1, SIZE));
//         const jplus = Math.floor(myMod(y + 1, SIZE));

//         const uij = texture[this.thread.y][this.thread.x];
//         const uimj = texture[this.thread.y][iminus];
//         const uipj = texture[this.thread.y][iplus];
//         const uijm = texture[jminus][this.thread.x];
//         const uijp = texture[jplus][this.thread.x];

//         return (
//             uij +
//             (dt / dx / dx) * (uijm + uijp - 2 * uij) +
//             (dt / dx / dx) * (uimj + uipj - 2 * uij)
//         );
//     })
//     .setOutput([SIZE, SIZE])
//     .setPipeline(true)
//     .setImmutable(true)
//     .setConstants({
//         SIZE
//     });