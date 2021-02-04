import {createReducer, createActions} from 'reduxsauce';
import {createSelector} from 'reselect';
import Immutable from 'seamless-immutable';

/* ------------- Types and Action Creators ------------- */

const {Types, Creators} = createActions({
  buy: ['data'],
  initLottery: [],

  getDrawPeriod: ['lotteryContract', 'lotteryInfo'],
  setDrawPeriod: ['drawPeriod'],

  getCurrentPeriod: ['lotteryContract', 'lotteryInfo'],
  setCurrentPeriod: ['currentPeriod'],

  getLotterySymbol: ['lotteryContract', 'lotteryInfo'],
  setLotterySymbol: ['lotterySymbol'],

  setLotteryBalance: ['lotteryBalance'],

  getLotteryPrice: ['lotteryContract', 'lotteryInfo'],
  setLotteryPrice: ['lotteryPrice'],

  getMaxMultiplied: ['lotteryContract', 'lotteryInfo'],
  setMaxMultiplied: ['maxMultiplied'],

  getLotteryRewards: ['lotteryContract', 'lotteryInfo'],
  setLotteryRewards: ['lotteryRewards'],

  getLotteryCashed: ['lotteryContract', 'lotteryInfo'],
  setLotteryCashed: ['lotteryCashed'],

  getLotteryDuration: ['lotteryContract', 'lotteryInfo'],
  setLotteryDuration: ['lotteryDuration'],

  getMyBetList: ['loadingPaging', 'callBack'],
  setMyBetList: ['myBetList'],

  getLottery: ['lotteryId', 'periodNumber'],
  setLottery: ['lotteryDetails'],

  takeReward: ['lotteryId'],

  getPeriodList: ['loadingPaging', 'callBack'],
  setPeriodList: ['periodList'],

  getRewardedList: ['loadingPaging', 'callBack'],
  setRewardedList: ['rewardedList'],

  reLottery: [],
  getRewardAmountsList: ['callBack'],
  setRewardAmountsList: ['rewardAmountsList'],
  getPeriodCountList: ['callBack'],
  setPeriodCountList: ['periodCountList'],
  getSelfWinningInfo: ['callBack'],
  setSelfWinningInfo: ['selfWinningInfo'],
});

export const lotteryTypes = Types;
export default Creators;

/* ------------- Initial State ------------- */

export const INITIAL_STATE = Immutable({
  drawPeriod: null,
  currentPeriod: null,
  lotterySymbol: null,
  lotteryBalance: 0,
  lotteryPrice: null,
  maxMultiplied: 10,
  lotteryRewards: null,
  lotteryCashed: null,
  lotteryDuration: null,
  myBetList: [],
  lotteryDetails: null,
  periodList: [],
  rewardedList: [],
  rewardAmountsList: [],
  periodCountList: [],
  selfWinningInfo: null,
});

/* ------------- Selectors ------------- */

const _baseSelector = state => state.lottery;

export const lotterySelectors = {
  getLotteryInfo: createSelector(_baseSelector, base => ({
    ...base,
    myBetList: null,
    lotteryDetails: null,
    periodList: null,
  })),
  myBetList: createSelector(_baseSelector, base => base.myBetList),
  periodList: createSelector(_baseSelector, base => base.periodList),
  lotteryDetails: createSelector(_baseSelector, base => base.lotteryDetails),
  rewardedList: createSelector(_baseSelector, base => base.rewardedList),
};

/* ------------- Reducers ------------- */

export const buy = state => {
  return state.merge();
};
export const initLottery = state => {
  return state.merge();
};

export const getDrawPeriod = state => {
  return state.merge();
};
export const setDrawPeriod = (state, {drawPeriod}) => {
  return state.merge({drawPeriod});
};

export const getCurrentPeriod = state => {
  return state.merge();
};
export const setCurrentPeriod = (state, {currentPeriod}) => {
  return state.merge({currentPeriod});
};

export const getLotterySymbol = state => {
  return state.merge();
};
export const setLotterySymbol = (state, {lotterySymbol}) => {
  return state.merge({lotterySymbol});
};

export const setLotteryBalance = (state, {lotteryBalance}) => {
  return state.merge({lotteryBalance});
};

export const getLotteryPrice = state => {
  return state.merge();
};
export const setLotteryPrice = (state, {lotteryPrice}) => {
  return state.merge({lotteryPrice});
};

export const getMaxMultiplied = state => {
  return state.merge();
};
export const setMaxMultiplied = (state, {maxMultiplied}) => {
  return state.merge({maxMultiplied});
};

export const getLotteryRewards = state => {
  return state.merge();
};
export const setLotteryRewards = (state, {lotteryRewards}) => {
  return state.merge({lotteryRewards});
};

export const getLotteryCashed = state => {
  return state.merge();
};
export const setLotteryCashed = (state, {lotteryCashed}) => {
  return state.merge({lotteryCashed});
};

export const getLotteryDuration = state => {
  return state.merge();
};
export const setLotteryDuration = (state, {lotteryDuration}) => {
  return state.merge({lotteryDuration});
};

export const getMyBetList = state => {
  return state.merge();
};
export const setMyBetList = (state, {myBetList}) => {
  return state.merge({myBetList});
};

export const getLottery = state => {
  return state.merge();
};
export const setLottery = (state, {lotteryDetails}) => {
  return state.merge({lotteryDetails});
};
export const takeReward = state => {
  return state.merge();
};

export const getPeriodList = state => {
  return state.merge();
};
export const setPeriodList = (state, {periodList}) => {
  return state.merge({periodList});
};

export const getRewardedList = state => {
  return state.merge();
};
export const setRewardedList = (state, {rewardedList}) => {
  return state.merge({rewardedList});
};
export const reLottery = state => {
  return state.merge({
    myBetList: [],
    lotteryDetails: null,
    rewardedList: [],
    selfWinningInfo: null,
  });
};
export const getRewardAmountsList = state => {
  return state.merge();
};
export const setRewardAmountsList = (state, {rewardAmountsList}) => {
  return state.merge({rewardAmountsList});
};
export const getPeriodCountList = state => {
  return state.merge();
};
export const setPeriodCountList = (state, {periodCountList}) => {
  return state.merge({periodCountList});
};
export const getSelfWinningInfo = state => {
  return state.merge();
};
export const setSelfWinningInfo = (state, {selfWinningInfo}) => {
  return state.merge({selfWinningInfo});
};
/* ------------- Hookup Reducers To Types ------------- */
export const reducer = createReducer(INITIAL_STATE, {
  [Types.BUY]: buy,
  [Types.INIT_LOTTERY]: initLottery,
  [Types.GET_DRAW_PERIOD]: getDrawPeriod,
  [Types.SET_DRAW_PERIOD]: setDrawPeriod,

  [Types.GET_CURRENT_PERIOD]: getCurrentPeriod,
  [Types.SET_CURRENT_PERIOD]: setCurrentPeriod,

  [Types.GET_LOTTERY_SYMBOL]: getLotterySymbol,
  [Types.SET_LOTTERY_SYMBOL]: setLotterySymbol,

  [Types.SET_LOTTERY_BALANCE]: setLotteryBalance,

  [Types.GET_LOTTERY_PRICE]: getLotteryPrice,
  [Types.SET_LOTTERY_PRICE]: setLotteryPrice,

  [Types.GET_MAX_MULTIPLIED]: getMaxMultiplied,
  [Types.SET_MAX_MULTIPLIED]: setMaxMultiplied,

  [Types.GET_LOTTERY_REWARDS]: getLotteryRewards,
  [Types.SET_LOTTERY_REWARDS]: setLotteryRewards,

  [Types.GET_LOTTERY_CASHED]: getLotteryCashed,
  [Types.SET_LOTTERY_CASHED]: setLotteryCashed,

  [Types.GET_LOTTERY_DURATION]: getLotteryDuration,
  [Types.SET_LOTTERY_DURATION]: setLotteryDuration,

  [Types.GET_MY_BET_LIST]: getMyBetList,
  [Types.SET_MY_BET_LIST]: setMyBetList,

  [Types.GET_LOTTERY]: getLottery,
  [Types.SET_LOTTERY]: setLottery,

  [Types.TAKE_REWARD]: takeReward,

  [Types.GET_PERIOD_LIST]: getPeriodList,
  [Types.SET_PERIOD_LIST]: setPeriodList,

  [Types.GET_REWARDED_LIST]: getRewardedList,
  [Types.SET_REWARDED_LIST]: setRewardedList,

  [Types.RE_LOTTERY]: reLottery,

  [Types.GET_REWARD_AMOUNTS_LIST]: getRewardAmountsList,
  [Types.SET_REWARD_AMOUNTS_LIST]: setRewardAmountsList,

  [Types.GET_PERIOD_COUNT_LIST]: getPeriodCountList,
  [Types.SET_PERIOD_COUNT_LIST]: setPeriodCountList,

  [Types.GET_SELF_WINNING_INFO]: getSelfWinningInfo,
  [Types.SET_SELF_WINNING_INFO]: setSelfWinningInfo,
});
