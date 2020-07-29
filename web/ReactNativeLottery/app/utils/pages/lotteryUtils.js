import moment from 'moment';
import {LOTTERY_DAY} from '../../config/lotteryConstant';
import {splitString} from '.';
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
const getBetValue = (betNumber, betPerValue = 0) => {
  return betNumber * betPerValue;
};
const getBetNumber = (data, betArr) => {
  let number = 0;
  if (
    Array.isArray(data) &&
    Array.isArray(betArr) &&
    data.length === betArr.length
  ) {
    number = 1;
    betArr.filter(item => {
      number = number * item.length;
    });
  }
  return number;
};
const getBetInfos = (type, betList) => {
  let betInfos = [];
  if (Array.isArray(betList)) {
    betInfos = [...betList];
    betInfos.reverse();
    switch (type) {
      case 0:
        betInfos = betInfos.map(item => {
          if (Array.isArray(item)) {
            return {
              bets: item.map(i => {
                return Math.abs(i - 3).toString();
              }),
            };
          }
        });
        break;
      default:
        betInfos = betInfos.map(item => {
          if (Array.isArray(item)) {
            return {
              bets: item,
            };
          }
        });
        break;
    }
  }
  console.log(betInfos, '====betInfos');
  return betInfos;
};
function padLeft(nr, n, str) {
  return Array(n - String(nr).length + 1).join(str || '0') + nr;
}
const getMillisecond = time => {
  const {seconds} = time || {};
  let tim = seconds || time;
  // if (nanos) {
  //   tim = tim + parseInt(nanos / 1000000);
  // }
  if (String(tim).length <= 10) {
    return tim * 1000;
  }
  return tim;
};
const getPeriod = (time, start, periodNumber) => {
  if (time === undefined || start === undefined || periodNumber === undefined) {
    return '';
  }
  let period = periodNumber - start;
  if (time) {
    period =
      moment(getMillisecond(time)).format(LOTTERY_DAY) + padLeft(period + 1, 3);
  }
  return period;
};
const getWinningNumbers = winningNumbers => {
  let win = '';
  if (typeof winningNumbers === 'number') {
    win = winningNumbers.toString();
  }
  win = padLeft(win, 5);
  return win;
};
const getWinningNumbersStr = winningNumbers => {
  let win = [];
  win = splitString(getWinningNumbers(winningNumbers));
  return win;
};
const GetThreeForm = winningNumbers => {
  let arr = getWinningNumbersStr(winningNumbers);
  const length = arr.length;
  let bool = false;
  arr = arr.splice(length - 3, length).sort();
  arr.forEach((i, k) => {
    if (i === arr[k + 1]) {
      bool = true;
    }
  });
  return bool;
};
const GetCombined = (winningNumbers, number = 3) => {
  let arr = getWinningNumbersStr(winningNumbers);
  const length = arr.length;
  arr = arr.splice(length - number, length).sort();
  let s = 0;
  arr.forEach(item => {
    s = s + Number(item);
  });
  return s;
};
export default {
  processingNumber,
  processingTool,
  getBetValue,
  getBetNumber,
  getBetInfos,
  getPeriod,
  getWinningNumbers,
  getWinningNumbersStr,
  GetThreeForm,
  GetCombined,
};
