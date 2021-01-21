import config from '../../config';
const {tokenDecimalFormat} = config;
export default {
  toLower: (number, num = tokenDecimalFormat) => {
    if (isNaN(number)) {
      return 0;
    }
    return number / num;
  },
  toHigher: (number, num = tokenDecimalFormat) => {
    if (isNaN(number)) {
      return 0;
    }
    return number * num;
  },
};
