import moment from 'moment';
import {splitString} from './index';
import i18n from 'i18n-js';
import {homeImage} from '../../assets/images';
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
const getBetValue = (betNumber, betPerValue = 0, multiplied = 1) => {
  return betNumber * betPerValue * multiplied;
};
const getBetNumber = (data, betArr) => {
  let number = 0;
  if (
    Array.isArray(data) &&
    Array.isArray(betArr) &&
    data.every((item, index) => {
      return betArr[index];
    })
  ) {
    number = 1;
    betArr.filter(item => {
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
    betArr.filter(item => {
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
const getPeriod = (time, start, periodNumber, noSpace) => {
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
  if (noSpace === true) {
    return periodNumber;
  }
  if (noSpace === 1) {
    return ' ' + periodNumber;
  }
  if (noSpace === 2) {
    return periodNumber + ' ';
  }
  return ' ' + periodNumber + ' ';
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
const getBetImage = type => {
  switch (type) {
    case 10:
      return homeImage[3];
    case 20:
      return homeImage[2];
    case 30:
      return homeImage[1];
    case 40:
      return homeImage[0];
    default:
      return homeImage[4];
  }
};
const getBetType = type => {
  let text = '';
  switch (type) {
    case 0:
      text = i18n.t('lottery.simple');
      break;
    case 10:
      text = `${i18n.t('lottery.oneStar')} ${i18n.t('lottery.directElection')}`;
      break;
    case 20:
      text = `${i18n.t('lottery.twoStars')} ${i18n.t(
        'lottery.directElection',
      )}`;
      break;
    case 30:
      text = `${i18n.t('lottery.threeStars')} ${i18n.t(
        'lottery.directElection',
      )}`;
      break;
    case 40:
      text = `${i18n.t('lottery.fiveStars')} ${i18n.t(
        'lottery.directElection',
      )}`;
  }
  return text;
};
const getStartMonthTime = time => {
  if (!time) {
    return '';
  }
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
const getSimpleAmount = (bonusAmount = 1, betList, betValue) => {
  let A = bonusAmount;
  let P = (bonusAmount || 1) - betValue;
  const amount = bonusAmount;
  if (Array.isArray(betList)) {
    let f = betList[0];
    let s = betList[1];
    if (Array.isArray(f) && Array.isArray(s)) {
      if (f.length === 4 && s.length === 4) {
        A = amount * 4;
        P = amount * 4 - betValue;
      } else {
        let t = 0,
          o = 0,
          m = 0;
        f.filter(i => i === '0' || i === '1').length && t++;
        f.filter(i => i === '2' || i === '3').length && t++;

        s.filter(i => i === '0' || i === '1').length && o++;
        s.filter(i => i === '2' || i === '3').length && o++;
        if (t === 1 && o === 1) {
          m = 1;
        } else if ((t === 2 && o === 1) || (t === 1 && o === 2)) {
          m = 2;
        } else if (t === 2 && o === 2) {
          m = 4;
        }
        if (m !== 1) {
          if ((s.length === 4 && t === 2) || (f.length === 4 && o === 2)) {
            A = `${amount * 2}~${amount * 4}`;
            P = `${amount * 2 - betValue}~${amount * 4 - betValue}`;
          } else if (
            (s.length === 4 && t === 1) ||
            (f.length === 4 && o === 1)
          ) {
            A = amount * 2;
            P = amount * 2 - betValue;
          } else {
            A = `${amount}~${amount * m}`;
            P = `${amount - betValue}~${amount * m - betValue}`;
          }
        }
      }
    }
  }
  return {A, P};
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
  getBetImage,
  getStartMonthTime,
  getDrawBetNumber,
  getWinningSituation,
  getCanAward,
  getDrawBetStr,
  getSimpleAmount,
  padLeft,
};
