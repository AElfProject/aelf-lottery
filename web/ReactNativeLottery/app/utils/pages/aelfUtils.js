import AElf from 'aelf-sdk';
import config from '../../config';
import unitConverter from './unitConverter';
import moment from 'moment';
import {TIME_FORMAT} from '../../config/constant';
import {aelfInstance} from '../common/aelfProvider';
const {explorerURL, address} = config;
const {prefix, suffix} = address;

const unlockKeystore = (params, pwd) => {
  return AElf.wallet.keyStore.unlockKeystore(params, pwd);
};
const checkPassword = (keyStore, pwd) => {
  return AElf.wallet.keyStore.checkPassword(keyStore, pwd);
};
const getTransactionFee = (Logs) => {
  const free = AElf.pbUtils.getTransactionFee(Logs || []);
  let cost = 0;
  let symbol = '';
  Array.isArray(free) &&
    free.filter((item) => {
      cost = cost + item.amount;
      symbol = item.symbol;
    });
  cost = unitConverter.toLower(cost);
  return {cost, symbol};
};
const getKeystore = (params, pwd, keystoreOptions) => {
  return AElf.wallet.keyStore.getKeystore(params, pwd, keystoreOptions);
};
const formatRestoreAddress = (addressInput) => {
  if (!addressInput) {
    return '';
  }
  const head = `${prefix}_`;
  const tail = `_${suffix}`;
  return addressInput
    .replace(new RegExp(head, 'g'), '')
    .replace(new RegExp(tail, 'g'), '');
};
const formatAddress = (addressInput) => {
  if (!addressInput || typeof addressInput !== 'string') {
    return '';
  }
  addressInput = formatRestoreAddress(addressInput);
  return prefix + '_' + addressInput + '_' + suffix;
};
const formatAddressHide = (addressInput) => {
  const length = 20;
  if (checkAddress(addressInput)) {
    addressInput = formatAddress(addressInput);
    if (typeof addressInput === 'string') {
      return (
        addressInput.substr(0, length) +
        '***' +
        addressInput.substr(addressInput.length - length, addressInput.length)
      );
    }
  }
};
//checkAddress
const checkAddress = (addressInput) => {
  addressInput = formatRestoreAddress(addressInput);
  const length = addressInput.length;
  return length >= 47 && length <= 51;
};
const webURLAddress = (addressInput) => {
  if (!addressInput) {
    return;
  }
  addressInput = formatRestoreAddress(addressInput);
  return `${explorerURL}/address/${addressInput}`;
};

const webURLTx = (addressInput) => {
  if (!addressInput) {
    return;
  }
  addressInput = formatRestoreAddress(addressInput);
  return `${explorerURL}/tx/${addressInput}`;
};
const getMillisecond = (time) => {
  const {seconds} = time || {};
  let tim = seconds || time;
  if (String(tim).length <= 10) {
    return tim * 1000;
  }
  return tim;
};
const timeConversion = (time, format) => {
  let showTime = '';
  if (time) {
    showTime = moment(getMillisecond(time)).format(format || TIME_FORMAT);
  }
  return showTime;
};
const getTxResult = (TransactionId) => {
  return aelfInstance.chain.getTxResult(TransactionId);
};
export default {
  checkPassword,
  webURLAddress,
  formatAddress,
  formatAddressHide,
  formatRestoreAddress,
  webURLTx,
  getTransactionFee,
  getKeystore,
  unlockKeystore,
  checkAddress,
  timeConversion,
  getTxResult,
};
