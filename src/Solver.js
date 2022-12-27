
class Solver {
    constructor(gpu, N, x0, x1, initialConditionFunction) {
        this.N = N
        this.x0 = x0
        this.x1 = x1
        this.gpu = gpu

        this.initialKernel = gpu
            .createKernel(initialConditionFunction)
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