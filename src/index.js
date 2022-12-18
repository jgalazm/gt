const { GPU } = require('gpu.js');
const gpu = new GPU();

const N = 512;

const a = Array(512).fill().map((val1,index1)=>Array(512).fill().map((val2,index2)=>index1+index2))

const b = Array(512).fill().map((val1,index1)=>Array(512).fill().map((val2,index2)=>index1+index2))

const multiplyMatrix = gpu.createKernel(function(a, b) {
    let sum = 0;
    for (let i = 0; i < 512; i++) {
        sum += a[this.thread.y][i] * b[i][this.thread.x];
    }
    return sum;
}).setOutput([512, 512]);

const c = multiplyMatrix(a, b);

console.log(c);