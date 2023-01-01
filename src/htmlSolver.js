class Solver {
    constructor(gpu, SIZE, dt, nu, x0, x1, initialConditionFunction) {
      this.gpu = gpu;
      this.SIZE = SIZE;
      this.dt = dt;
      this.x0 = x0;
      this.x1 = x1;
      this.CONSTANTS = {
        SIZE: SIZE,
        DT: dt,
        NU: nu,
        X0: x0,
        X1: x1
      }

      const tactic = "precision";
      this.initialKernel = gpu
        .createKernel(initialConditionFunction)
        .setOutput([SIZE, SIZE])
        .setPipeline(true)
        .setConstants(this.CONSTANTS)
        .setTactic(tactic);
      this.kernel1 = gpu
        .createKernel(function (texture) {
          const x = this.thread.x;
          const y = this.thread.y;
          const SIZE = this.constants.SIZE;
          const dx = 1 / (this.constants.SIZE-1);
          const nu = this.constants.NU;
        //   const dt = 0.2 * dx * dx;
          const dt = this.constants.DT;
          const boundary = 0.0;
          if (this.thread.x === 0) return boundary;
          if (this.thread.y === 0) return boundary;
          if (this.thread.x === SIZE - 1) return boundary;
          if (this.thread.y === SIZE - 1) return boundary;
          const uij = texture[this.thread.y][this.thread.x];
          const uimj = texture[this.thread.y][this.thread.x - 1];
          const uipj = texture[this.thread.y][this.thread.x + 1];
          const uijm = texture[this.thread.y - 1][this.thread.x];
          const uijp = texture[this.thread.y + 1][this.thread.x];

          return (
            uij +
            nu * (dt / dx / dx) * (uijm + uijp - 2 * uij) +
            nu * (dt / dx / dx) * (uimj + uipj - 2 * uij)
          );
        })
        .setOutput([SIZE, SIZE])
        .setPipeline(true)
        .setImmutable(true)
        .setConstants(this.CONSTANTS)
        .setTactic(tactic);
      this.kernel2 = gpu
        .createKernel(function (texture) {
          return texture[this.thread.y][this.thread.x];
        })
        .setOutput([SIZE, SIZE])
        .setPipeline(true)
        .setImmutable(true)
        .setTactic(tactic);

      this.render = gpu
        .createKernel(function (texture) {
          const val = texture[this.thread.y][this.thread.x];
          this.color((val+0.01)/0.02, 0, 0, 1);
        })
        .setOutput([SIZE, SIZE])
        .setGraphical(true)
        .setConstants(this.CONSTANTS)
        .setTactic(tactic);
    }
  }

  export {Solver};