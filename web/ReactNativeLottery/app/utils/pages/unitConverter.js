import config from '../../config';
const {tokenDecimalFormat} = config;
export default {
  toLower: (number, num = tokenDecimalFormat) => {
    return number / num;
  },
  toHigher: (number, num = tokenDecimalFormat) => {
    return number * num;
  },
};
