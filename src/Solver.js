class Solver {
    constructor(gpu, N, x0, x1, initialConditionFunction) {
      this.N = N;
      this.x0 = x0;
      this.x1 = x1;
      this.gpu = gpu;
  
      this.initialKernel = gpu
        .createKernel(initialConditionFunction)
        .setOutput([this.N, this.N])
        .setPipeline(true)
        .setConstants({
          SIZE: this.N,
          X0: this.x0,
          X1: this.x1,
        });
  
    //   this.render = gpu
    //     .createKernel(function (texture) {
    //       const val = texture[this.thread.y][this.thread.x];
    //       // this.color(val / this.constants.SIZE, 1, 1, 1);
    //       this.color(val, 0, 0, 1);
    //     })
    //     .setOutput([N, N])
    //     .setGraphical(true)
    //     .setConstants({
    //       SIZE: this.N,
    //     });
  
      this.solverKernel = gpu
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
        .setOutput([this.N, this.N])
        .setPipeline(true)
        .setImmutable(true)
        .setConstants({
          SIZE: this.N,
        });
    }
  }
  
  module.exports.Solver = Solver;
  