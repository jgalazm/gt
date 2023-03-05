class Solver {
    constructor(gpu, N, x0, x1, dt, nu, initialConditionFunction) {
      this.N = N;
      this.x0 = x0;
      this.x1 = x1;
      this.gpu = gpu;
      this.dt = dt; 
      this.nu = nu;
      this.dx = (x1-x0)/(N-1);

      const CONSTANTS = {
        SIZE: this.N,
        X0: this.x0,
        X1: this.x1,
        DT: this.dt,
        NU: this.nu,
        dx: this.dx
      }
  
      this.initialKernel = gpu
        .createKernel(initialConditionFunction)
        .setOutput([this.N, this.N])
        .setPipeline(true)
        .setConstants(CONSTANTS)
        .setTactic("precision");
  
      this.render = gpu
        .createKernel(function (texture) {
          const val = texture[this.thread.y][this.thread.x];
          // this.color(val / this.constants.SIZE, 1, 1, 1);
          this.color(val/0.000001, 0, 0, 1);
        })
        .setOutput([N, N])
        .setGraphical(true)
        .setConstants({
          SIZE: this.N,
        });
  
    this.solverKernel = gpu
    .createKernel(function(a){
        const SIZE = this.constants.SIZE;
        const dt = this.constants.DT;
        const nu = this.constants.NU;
        const dx = this.constants.dx;
        const boundary = 0.0;
        if( this.thread.x === 0) return boundary;
        if( this.thread.y === 0 ) return boundary;
        if( this.thread.x === SIZE-1) return boundary;
        if( this.thread.y === SIZE-1) return boundary;
        const uij = texture[this.thread.y][this.thread.x];
        const uimj = texture[this.thread.y][this.thread.x-1];
        const uipj = texture[this.thread.y][this.thread.x+1];
        const uijm = texture[this.thread.y-1][this.thread.x];
        const uijp = texture[this.thread.y+1][this.thread.x];      

        return (
          uij +
          (dt / dx / dx) * (uijm + uijp - 2 * uij) +
          (dt / dx / dx) * (uimj + uipj - 2 * uij)
        );
    })
    .setOutput([this.N, this.N])
    .setPipeline(true)
    .setConstants(CONSTANTS)
    .setTactic("precision");
    }
  }
  
//   module.exports.Solver = Solver;
export default Solver;
  