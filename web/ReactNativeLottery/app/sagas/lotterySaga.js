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
import settingsActions, {settingsTypes} from '../redux/settingsRedux';
import i18n from 'i18n-js';
import config from '../config';
import {Loading, CommonToast, OverlayModal} from '../components/template';
import lotteryActions, {
  lotteryTypes,
  lotterySelectors,
} from '../redux/lotteryRedux';
import {userSelectors} from '../redux/userRedux';
import lotteryUtils from '../utils/pages/lotteryUtils';
import aelfUtils from '../utils/pages/aelfUtils';
import unitConverter from '../utils/pages/unitConverter';
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
export default function* SettingsSaga() {
  yield all([
    yield takeLatest(lotteryTypes.BUY, buySaga),
    yield takeLatest(lotteryTypes.INIT_LOTTERY, initLotterySaga),
    yield takeLatest(lotteryTypes.GET_DRAW_PERIOD, getDrawPeriodSaga),
    yield takeLatest(lotteryTypes.GET_CURRENT_PERIOD, getCurrentPeriodSaga),
    yield takeLatest(lotteryTypes.GET_LOTTERY_PRICE, getLotteryPriceSaga),
    yield takeLatest(lotteryTypes.GET_LOTTERY_REWARDS, getLotteryRewardsSaga),
  ]);
}
