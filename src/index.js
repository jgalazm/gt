const { GPU } = require("gpu.js");
function myMod(x, y) {
    return y * (x / y - Math.floor(x / y));
}
const gpu = new GPU({
    mode: "gpu",
    functions: [myMod]
});


const N = 512;
const SIZE = N;


const initialKernel = gpu
    .createKernel(function () {
        const x_index = this.thread.x;
        const y_index = this.thread.y;
        const N = this.constants.SIZE;
        const x0 = this.constants.X0;
        const x1 = this.constants.X1;
        const x = x_index / (N - 1) * (x1 - x0)
        const y = y_index / (N - 1) * (x1 - x0)
        return Math.sin(x * Math.PI / 2) * Math.sin(y * Math.PI / 2)
    })
    .setOutput([512, 512])
    .setPipeline(true)
    .setConstants({
        SIZE: N,
        X0: 0,
        X1: 1
    });

const solverKernel = gpu
    .createKernel(function (texture) {
        const x = this.thread.x;
        const y = this.thread.y;
        const SIZE = this.constants.SIZE;
        const dx = 1 / this.constants.SIZE;
        const dt = 0.2 * dx * dx;
        const iminus = Math.floor(myMod(x - 1, SIZE));
        const jminus = Math.floor(myMod(y - 1, SIZE));
        const iplus = Math.floor(myMod(x + 1, SIZE));
        const jplus = Math.floor(myMod(y + 1, SIZE));

        const uij = texture[this.thread.y][this.thread.x];
        const uimj = texture[this.thread.y][iminus];
        const uipj = texture[this.thread.y][iplus];
        const uijm = texture[jminus][this.thread.x];
        const uijp = texture[jplus][this.thread.x];

        return (
            uij +
            (dt / dx / dx) * (uijm + uijp - 2 * uij) +
            (dt / dx / dx) * (uimj + uipj - 2 * uij)
        );
    })
    .setOutput([SIZE, SIZE])
    .setPipeline(true)
    .setImmutable(true)
    .setConstants({
        SIZE
    });
const render = gpu
    .createKernel(function (texture) {
        const val = texture[this.thread.y][this.thread.x];
        // this.color(val / this.constants.SIZE, 1, 1, 1);
        this.color(val,0,0,1);
    })
    .setOutput([N, N])
    .setGraphical(true)
    .setConstants({
        SIZE: N
    });


const initialResult = initialKernel();
render(initialResult);
const pixels = render.getPixels();
var savePixels = require("save-pixels")
var ndarray = require("ndarray");
const reshaped = ndarray(pixels, [N,N,4]);
savePixels(reshaped, "png").pipe(process.stdout)

const firstStepResult = solverKernel(initialResult);