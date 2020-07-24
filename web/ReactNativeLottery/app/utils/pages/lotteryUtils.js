import config from '../../config';
const {betPerValue} = config;
/**
 * processing Number
 * @param  {Array}   list         operation array
 * @param  {number}  first        First place in two-dimensional array
 * @param  {number}  second       Two-dimensional array second place
 */
const processingNumber = (list, first, second) => {
  let arr = Array.isArray(list) ? [...list] : [];
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
/**
 * processing Tool
 * @param  {Array}   data         data
 * @param  {Array}   List         operation array
 * @param  {number}  first        First place in two-dimensional array
 * @param  {string}  type         type
 */
const processingTool = (data, list, first, type) => {
  let arr = Array.isArray(list) ? [...list] : [];
  if (!Array.isArray(arr[first])) {
    arr[first] = [];
  }
  if (!Array.isArray(data[first].playList)) {
    return arr;
  }
  switch (type) {
    case 'big':
      arr[first] = data[first].playList.filter(item => item >= 5);
      break;
    case 'small':
      arr[first] = data[first].playList.filter(item => item < 5);
      break;
    case 'odd':
      arr[first] = data[first].playList.filter(item => item % 2 !== 0);
      break;
    case 'even':
      arr[first] = data[first].playList.filter(item => item % 2 === 0);
      break;
    case 'all':
      arr[first] = data[first].playList;
      break;
    case 'clear':
      arr[first] = [];
      break;
  }
  if (JSON.stringify(arr) !== JSON.stringify(list)) {
    return arr;
  } else {
    return list;
  }
};
const getBetValue = betNumber => {
  return betNumber * betPerValue;
};
const getBetNumber = betArr => {
  let number = 0;
  if (Array.isArray(betArr)) {
    betArr.forEach(item => {
      if (Array.isArray(item)) {
        number = number + item.length;
      }
    });
  }
  return number;
};
export default {
  processingNumber,
  processingTool,
  getBetValue,
  getBetNumber,
};
