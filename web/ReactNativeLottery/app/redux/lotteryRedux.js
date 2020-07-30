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

  setLotterySymbol: ['lotterySymbol'],
  setLotteryBalance: ['lotteryBalance'],

  getLotteryPrice: ['lotteryContract', 'lotteryInfo'],
  setLotteryPrice: ['lotteryPrice'],

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
  lotteryRewards: null,
  lotteryCashed: null,
  lotteryDuration: null,
  myBetList: [],
  lotteryDetails: null,
});

/* ------------- Selectors ------------- */

const _baseSelector = state => state.lottery;

export const lotterySelectors = {
  getLotteryInfo: createSelector(
    _baseSelector,
    base => ({
      ...base,
      myBetList: null,
      lotteryDetails: null,
    }),
  ),
  myBetList: createSelector(
    _baseSelector,
    base => base.myBetList,
  ),
  lotteryDetails: createSelector(
    _baseSelector,
    base => base.lotteryDetails,
  ),
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
/* ------------- Hookup Reducers To Types ------------- */
export const reducer = createReducer(INITIAL_STATE, {
  [Types.BUY]: buy,
  [Types.INIT_LOTTERY]: initLottery,
  [Types.GET_DRAW_PERIOD]: getDrawPeriod,
  [Types.SET_DRAW_PERIOD]: setDrawPeriod,

  [Types.GET_CURRENT_PERIOD]: getCurrentPeriod,
  [Types.SET_CURRENT_PERIOD]: setCurrentPeriod,

  [Types.SET_LOTTERY_SYMBOL]: setLotterySymbol,
  [Types.SET_LOTTERY_BALANCE]: setLotteryBalance,

  [Types.GET_LOTTERY_PRICE]: getLotteryPrice,
  [Types.SET_LOTTERY_PRICE]: setLotteryPrice,

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
});
