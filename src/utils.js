function myMod(x, y) {
    return y * (x / y - Math.floor(x / y));
}



const findMin = arr =>  arr.reduce((min, row) => {
    return Math.min(min, Math.min(...row));
}, Infinity);

const argMin = arr =>  arr.reduce((minIndex, row, i) => {
    const rowMinIndex = row.indexOf(Math.min(...row));
    if (arr[minIndex[0]][minIndex[1]] > arr[i][rowMinIndex]) {
      return [i, rowMinIndex];
    }
    return minIndex;
  }, [0, 0]);

const findMax = arr =>  arr.reduce((max, row) => {
return Math.max(max, Math.max(...row));
}, -Infinity);

const argMax = arr =>  arr.reduce((maxIndex, row, i) => {
    const rowMaxIndex = row.indexOf(Math.max(...row));
    if (arr[maxIndex[0]][maxIndex[1]] < arr[i][rowMaxIndex]) {
      return [i, rowMaxIndex];
    }
    return maxIndex;
  }, [0, 0]);
  
  export {myMod, findMin, argMin, findMax, argMax};