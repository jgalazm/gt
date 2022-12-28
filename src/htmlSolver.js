class Solver {
    constructor(gpu, SIZE, initialConditionFunction) {
      this.gpu = gpu;
      this.SIZE = SIZE;
      this.initialKernel = gpu
        .createKernel(initialConditionFunction)
        .setOutput([SIZE, SIZE])
        .setPipeline(true)
        .setConstants({
          SIZE
        });
      this.kernel1 = gpu
        .createKernel(function (texture) {
          const x = this.thread.x;
          const y = this.thread.y;
          const SIZE = this.constants.SIZE;
          const dx = 1 / this.constants.SIZE;
          const dt = 0.2 * dx * dx;
          const boundary = SIZE;
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
      this.kernel2 = gpu
        .createKernel(function (texture) {
          return texture[this.thread.y][this.thread.x];
        })
        .setOutput([SIZE, SIZE])
        .setPipeline(true)
        .setImmutable(true);

      this.render = gpu
        .createKernel(function (texture) {
          const val = texture[this.thread.y][this.thread.x];
          this.color(val / this.constants.SIZE, 0, 0, 1);
        })
        .setOutput([SIZE, SIZE])
        .setGraphical(true)
        .setConstants({
          SIZE
        });
      document.body.appendChild(this.render.canvas);
    }
  }

  export {Solver};