function myMod(x, y) {
    return y * (x / y - Math.floor(x / y));
}


const infNormTwoD = (matrix) =>
  Math.max(...matrix.map((row) => Math.max(...row.map((v) => Math.abs(v)))));

module.exports = {myMod, infNormTwoD};