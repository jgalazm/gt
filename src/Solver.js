
class Solver {
    constructor(gpu, N, x0, x1) {
        this.N = N
        this.x0 = x0
        this.x1 = x1
        this.gpu = gpu

        this.initialKernel = gpu
            .createKernel(function () {
                const xIndex = this.thread.x;
                const yIndex = this.thread.y;
                const N = this.constants.SIZE;
                const x0 = this.constants.X0;
                const x1 = this.constants.X1;
                const x = xIndex / (N - 1) * (x1 - x0)
                const y = yIndex / (N - 1) * (x1 - x0)
                return Math.sin(x * Math.PI / 2) * Math.sin(y * Math.PI / 2)
            })
            .setOutput([this.N, this.N])
            .setPipeline(true)
            .setConstants({
                SIZE: this.N,
                X0: this.x0,
                X1: this.x1
            });

        this.render = gpu
        .createKernel(function (texture) {
            const val = texture[this.thread.y][this.thread.x];
            // this.color(val / this.constants.SIZE, 1, 1, 1);
            this.color(val,0,0,1);
        })
        .setOutput([N, N])
        .setGraphical(true)
        .setConstants({
            SIZE: this.N
        });
    }
}


module.exports.Solver = Solver