import moment from 'moment';
import {splitString} from '.';
import i18n from 'i18n-js';
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
const getBetNumber = (data, betArr, disabledRule) => {
  let number = 0;
  if (
    Array.isArray(data) && Array.isArray(betArr) && disabledRule
      ? disabledRule()
      : data.every((item, index) => {
          return betArr[index];
        })
  ) {
    number = 1;
    betArr.forEach(item => {
      if (Array.isArray(item)) {
        number = number * item.length;
      }
    });
  }
  return number;
};

const getDrawBetNumber = betArr => {
  let number = 0;
  if (Array.isArray(betArr)) {
    number = 1;
    betArr.forEach(item => {
      if (Array.isArray(item.bets)) {
        number = number * item.bets.length;
      }
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
  if (!time || start === undefined || periodNumber === undefined) {
    return '';
  }
  // The UTC time zone stored in the contract is not synchronized with the App local time zone
  // let period = periodNumber - start;
  // if (time) {
  //   period =
  //     moment(getMillisecond(time)).format(LOTTERY_DAY) + padLeft(period + 1, 3);
  // }
  // return period;
  return periodNumber;
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
const getThreeForm = winningNumbers => {
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
const getCombined = (winningNumbers, number = 3) => {
  let arr = getWinningNumbersStr(winningNumbers);
  const length = arr.length;
  arr = arr.splice(length - number, length);
  let s = 0;
  arr.forEach(item => {
    s = s + parseInt(item, 10);
  });
  return s.toString();
};
const getBetType = type => {
  let text = '';
  switch (type) {
    case 0:
      text = i18n.t('lottery.simple');
      break;
    case 10:
      text = `${i18n.t('lottery.oneStar')}${i18n.t('lottery.directElection')}`;
      break;
    case 20:
      text = `${i18n.t('lottery.twoStars')}${i18n.t('lottery.directElection')}`;
      break;
    case 30:
      text = `${i18n.t('lottery.threeStars')}${i18n.t(
        'lottery.directElection',
      )}`;
      break;
    case 40:
      text = `${i18n.t('lottery.fiveStars')}${i18n.t(
        'lottery.directElection',
      )}`;
  }
  return text;
};
const getStartMonthTime = time => {
  return moment(getMillisecond(time)).format('MM-DD HH:mm');
};
const getWinningSituation = (cashed, expired, reward, noDraw) => {
  if (noDraw) {
    return i18n.t('lottery.lotteryUtils.noDraw');
  }
  let text = i18n.t('lottery.lotteryUtils.notWinning');
  if (reward && reward > 0) {
    text = cashed
      ? i18n.t('lottery.lotteryUtils.awarded')
      : expired
      ? i18n.t('lottery.lotteryUtils.expired')
      : i18n.t('lottery.lotteryUtils.noPrize');
  }
  return text;
};
const getCanAward = (cashed, expired, reward) => {
  return reward && reward > 0 && !expired && !cashed;
};
const getDrawBetStr = (type, betInfos) => {
  const TITLE = [
    i18n.t('lottery.onesPlace'),
    i18n.t('lottery.tenPlace'),
    i18n.t('lottery.hundreds'),
    i18n.t('lottery.thousands'),
    i18n.t('lottery.tenThousand'),
  ];
  const SIMPLE = {
    3: i18n.t('lottery.big'),
    2: i18n.t('lottery.small'),
    1: i18n.t('lottery.odd'),
    0: i18n.t('lottery.even'),
  };
  let List;
  if (Array.isArray(betInfos)) {
    let titleList = TITLE.splice(0, betInfos.length);
    switch (type) {
      case 0:
        List = [
          ...betInfos.map((item, index) => {
            if (Array.isArray(item.bets)) {
              return {
                title: titleList[index],
                bets: item.bets.map(i => {
                  return SIMPLE[i];
                }),
              };
            }
          }),
        ];
        break;
      default:
        List = [
          ...betInfos.map((item, index) => {
            if (Array.isArray(item.bets)) {
              return {
                title: titleList[index],
                bets: item.bets,
              };
            }
          }),
        ];
        break;
    }
    List.reverse();
  }
  return List;
};
const getSimpleAmount = (bonusAmount, betList, betValue) => {
  let A = bonusAmount;
  let P = (bonusAmount || 1) - betValue;
  if (Array.isArray(betList)) {
    let f = betList[0];
    let s = betList[1];
    if (Array.isArray(f) && Array.isArray(s)) {
      console.log(betList, '=====betList');
      if (f.length === 4 && s.length === 4) {
        A = bonusAmount * 4;
        P = bonusAmount * 4 - betValue;
      } else if (f.length !== 1 || s.length !== 1) {
        A = `${bonusAmount}~${bonusAmount * 4}`;
        P = `${bonusAmount - betValue}~${bonusAmount * 4 - betValue}`;
      }
    }
  }
  return {A, P};
};
const getTwoArrayLength = arr => {
  let number = 0;
  if (Array.isArray(arr)) {
    arr.forEach(item => {
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
  getBetInfos,
  getPeriod,
  getWinningNumbers,
  getWinningNumbersStr,
  getThreeForm,
  getCombined,
  getBetType,
  getStartMonthTime,
  getDrawBetNumber,
  getWinningSituation,
  getCanAward,
  getDrawBetStr,
  getSimpleAmount,
  padLeft,
  getTwoArrayLength,
};
