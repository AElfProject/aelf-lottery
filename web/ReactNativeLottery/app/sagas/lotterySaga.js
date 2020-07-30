/* ***********************************************************
 * A short word on how to use this automagically generated file.
 * We're often asked in the ignite glitter channel how to connect
 * to a to a third party api, so we thought we'd demonstrate - but
 * you should know you can use sagas for other flow control too.
 *
 * Other points:
 *  - You'll need to add this saga to sagas/index.js
 *  - This template uses the api declared in sagas/index.js, so
 *    you'll need to define a constant in that file.
 *************************************************************/

import {all, takeLatest, put, delay, select} from 'redux-saga/effects';
import i18n from 'i18n-js';
import config from '../config';
import {Loading, CommonToast, OverlayModal} from '../components/template';
import lotteryActions, {
  lotteryTypes,
  lotterySelectors,
} from '../redux/lotteryRedux';
import userActions, {userSelectors} from '../redux/userRedux';
import lotteryUtils from '../utils/pages/lotteryUtils';
import aelfUtils from '../utils/pages/aelfUtils';
import unitConverter from '../utils/pages/unitConverter';
import {LOTTERY_LIMIT} from '../config/lotteryConstant';
import navigationService from '../utils/common/navigationService';
const {contractNameAddressSets, lotterySellerAddress} = config;
function* buySaga({data}) {
  try {
    Loading.show();
    const {betList, lotteryType} = data || {};
    const userInfo = yield select(userSelectors.getUserInfo);
    const {lotteryContract} = userInfo.contracts || {};
    const betInfos = lotteryUtils.getBetInfos(lotteryType, betList);
    if (lotteryContract) {
      const BuyInput = {
        betInfos,
        type: lotteryType,
        seller: lotterySellerAddress,
      };
      console.log(betInfos, '=====betInfos');
      const buy = yield lotteryContract.Buy(BuyInput);
      yield delay(3000);
      const result = yield aelfUtils.getTxResult(buy.TransactionId);
      Loading.hide();
      OverlayModal.hide();
      CommonToast.success('购买成功');
      console.log(result, '======result');
    }
  } catch (error) {
    OverlayModal.hide();
    Loading.hide();
    CommonToast.fail('购买失败');
    console.log('buySaga', error);
  }
}
function* initLotterySaga() {
  try {
    const userInfo = yield select(userSelectors.getUserInfo);
    const lotteryInfo = yield select(lotterySelectors.getLotteryInfo);

    const {lotteryContract, tokenContract} = userInfo.contracts || {};
    if (lotteryContract) {
      yield put(lotteryActions.getDrawPeriod(lotteryContract, lotteryInfo));

      yield put(lotteryActions.getCurrentPeriod(lotteryContract, lotteryInfo));

      yield put(lotteryActions.getLotteryPrice(lotteryContract, lotteryInfo));

      yield put(lotteryActions.getLotteryRewards(lotteryContract, lotteryInfo));

      yield put(lotteryActions.getLotteryCashed(lotteryContract, lotteryInfo));

      yield put(
        lotteryActions.getLotteryDuration(lotteryContract, lotteryInfo),
      );

      const symbol = yield lotteryContract.GetTokenSymbol.call();
      const lotterySymbol = (symbol || {}).value;
      if (lotteryInfo.lotterySymbol !== lotterySymbol) {
        yield put(lotteryActions.setLotterySymbol(lotterySymbol));
      }

      const lotteryBalance = yield tokenContract.GetBalance.call({
        symbol: lotterySymbol,
        owner: contractNameAddressSets.lotteryContract,
      });
      const confirmBlance = unitConverter.toLower(lotteryBalance.balance);
      if (lotteryInfo.lotteryBalance !== confirmBlance) {
        yield put(lotteryActions.setLotteryBalance(confirmBlance));
      }
    }
  } catch (error) {
    console.log('initLotterySaga', error);
  }
}
function* getDrawPeriodSaga({lotteryContract, lotteryInfo}) {
  try {
    const drawPeriod = yield lotteryContract.GetLatestDrawPeriod.call();
    if (JSON.stringify(lotteryInfo.drawPeriod) !== JSON.stringify(drawPeriod)) {
      console.log(drawPeriod, '=====drawPeriod');
      yield put(lotteryActions.setDrawPeriod(drawPeriod));
    }
  } catch (error) {
    console.log('getDrawPeriodSaga', error);
  }
}
function* getCurrentPeriodSaga({lotteryContract, lotteryInfo}) {
  try {
    const currentPeriod = yield lotteryContract.GetCurrentPeriod.call();
    if (
      JSON.stringify(lotteryInfo.currentPeriod) !==
      JSON.stringify(currentPeriod)
    ) {
      yield put(lotteryActions.setCurrentPeriod(currentPeriod));
    }
  } catch (error) {
    console.log('getCurrentPeriodSaga', error);
  }
}
function* getLotteryPriceSaga({lotteryContract, lotteryInfo}) {
  try {
    const price = yield lotteryContract.GetPrice.call();
    const lotteryPrice = unitConverter.toLower(price?.value);
    if (lotteryInfo.lotteryPrice !== lotteryPrice) {
      yield put(lotteryActions.setLotteryPrice(lotteryPrice));
    }
  } catch (error) {
    console.log('getCurrentPeriodSaga', error);
  }
}
function* getLotteryRewardsSaga({lotteryContract, lotteryInfo}) {
  try {
    const result = yield lotteryContract.GetRewards.call();
    const {rewards} = result || {};
    if (Array.isArray(rewards)) {
      let lotteryRewards = {};
      rewards.forEach(item => {
        lotteryRewards[item.type] = unitConverter.toLower(item.amount);
      });
      if (
        JSON.stringify(lotteryInfo.lotteryRewards) !==
        JSON.stringify(lotteryRewards)
      ) {
        yield put(lotteryActions.setLotteryRewards(lotteryRewards));
      }
    }
  } catch (error) {
    console.log('getCurrentPeriodSaga', error);
  }
}
function* getLotteryCashedSaga({lotteryContract, lotteryInfo}) {
  try {
    const result = yield lotteryContract.GetLatestCashedLottery.call();
    const {periodNumber} = lotteryInfo.lotteryCashed || {};
    if (periodNumber !== result.periodNumber) {
      const period = yield lotteryContract.GetPeriod.call({
        value: result.periodNumber,
      });
      const obj = {...result, ...period};
      if (JSON.stringify(lotteryInfo.lotteryCashed) !== JSON.stringify(obj)) {
        yield put(lotteryActions.setLotteryCashed(obj));
      }
    }
  } catch (error) {
    console.log('getLotteryCashedSaga', error);
  }
}
function* getLotteryDurationSaga({lotteryContract, lotteryInfo}) {
  try {
    const result = yield lotteryContract.GetCashDuration.call();
    const {value} = result || {};
    if (lotteryInfo.lotteryDuration !== value) {
      yield put(lotteryActions.setLotteryDuration(value));
    }
  } catch (error) {
    console.log('getLotteryDurationSaga', error);
  }
}

function* getMyBetListSaga({loadingPaging, callBack}) {
  try {
    const userInfo = yield select(userSelectors.getUserInfo);
    const {lotteryContract} = userInfo.contracts || {};
    if (lotteryContract) {
      const myBetList = yield select(lotterySelectors.myBetList);
      let offset = 0;
      if (loadingPaging && Array.isArray(myBetList)) {
        offset = myBetList.length;
      }
      const result = yield lotteryContract.GetLotteries.call({
        offset,
        limit: LOTTERY_LIMIT,
      });
      const {lotteries} = result || {};
      if (Array.isArray(lotteries)) {
        let list = [];
        if (loadingPaging) {
          if (Array.isArray(myBetList)) {
            list = list.concat(myBetList);
          }
        }
        list = list.concat(lotteries);
        if (lotteries.length < LOTTERY_LIMIT) {
          callBack && callBack(0);
        } else {
          callBack && callBack(1);
        }
        yield put(lotteryActions.setMyBetList(list));
      } else {
        callBack && callBack(0);
      }
    }
  } catch (error) {
    callBack && callBack(-1);
    console.log(error, '======getMyBetListSaga');
  }
}

function* getLotterySaga({lotteryId, periodNumber}) {
  try {
    Loading.show();
    const userInfo = yield select(userSelectors.getUserInfo);
    const {lotteryContract} = userInfo.contracts || {};
    if (lotteryContract) {
      const result = yield lotteryContract.GetPeriod.call({
        value: periodNumber,
      });
      const lotteryResult = yield lotteryContract.GetLottery.call({
        lotteryId,
      });
      const {lottery} = lotteryResult || {};
      yield put(
        lotteryActions.setLottery({...(result || {}), ...(lottery || {})}),
      );
      Loading.hide();
      navigationService.navigate('Award');
    }
  } catch (error) {
    Loading.hide();
    console.log('getLotterySaga', error);
  }
}

function* takeRewardSaga({lotteryId}) {
  try {
    Loading.show();
    const userInfo = yield select(userSelectors.getUserInfo);
    const {lotteryContract} = userInfo.contracts || {};
    if (lotteryContract) {
      console.log(lotteryId, '=====lotteryId');
      const reward = yield lotteryContract.TakeReward({
        lotteryId,
      });
      console.log(reward, '=====reward');
      yield delay(3000);
      const result = yield aelfUtils.getTxResult(reward.TransactionId);
      console.log(result, '======result');
      Loading.hide();
      CommonToast.success('领奖成功');
      yield put(userActions.getUserBalance());
      navigationService.goBack();
    }
  } catch (error) {
    Loading.hide();
    CommonToast.fail('领奖失败稍后再试');
    console.log('getLotterySaga', error);
  }
}
export default function* SettingsSaga() {
  yield all([
    yield takeLatest(lotteryTypes.BUY, buySaga),
    yield takeLatest(lotteryTypes.INIT_LOTTERY, initLotterySaga),
    yield takeLatest(lotteryTypes.GET_DRAW_PERIOD, getDrawPeriodSaga),
    yield takeLatest(lotteryTypes.GET_CURRENT_PERIOD, getCurrentPeriodSaga),
    yield takeLatest(lotteryTypes.GET_LOTTERY_PRICE, getLotteryPriceSaga),
    yield takeLatest(lotteryTypes.GET_LOTTERY_REWARDS, getLotteryRewardsSaga),
    yield takeLatest(lotteryTypes.GET_LOTTERY_CASHED, getLotteryCashedSaga),
    yield takeLatest(lotteryTypes.GET_LOTTERY_DURATION, getLotteryDurationSaga),
    yield takeLatest(lotteryTypes.GET_MY_BET_LIST, getMyBetListSaga),
    yield takeLatest(lotteryTypes.GET_LOTTERY, getLotterySaga),
    yield takeLatest(lotteryTypes.TAKE_REWARD, takeRewardSaga),
  ]);
}
