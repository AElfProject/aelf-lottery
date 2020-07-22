/**
 * Processing Number
 * @param  {Array}   selectedList operation array
 * @param  {number}  first        First place in two-dimensional array
 * @param  {number}  second       Two-dimensional array second place
 */
const ProcessingNumber = (selectedList, first, second) => {
  let arr = Array.isArray(selectedList) ? [...selectedList] : [];
  if (!Array.isArray(arr[first])) {
    arr[first] = [];
  }
  const index = arr[first].findIndex(item => second === item);
  if (index !== -1) {
    arr[first] = arr[first].filter((item, ind) => index !== ind);
  } else {
    arr[first].push(second);
  }
  return arr;
};

export default {
  ProcessingNumber,
};
