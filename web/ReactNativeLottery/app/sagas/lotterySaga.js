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
const {contractNameAddressSets, lotterySellerAddress, tokenSymbol} = config;
function* buySaga({data}) {
  try {
    Loading.show();
    const {betList, lotteryType, multiplied} = data || {};
    const userInfo = yield select(userSelectors.getUserInfo);
    const {lotteryContract} = userInfo.contracts || {};
    const betInfos = lotteryUtils.getBetInfos(lotteryType, betList);
    if (lotteryContract) {
      const BuyInput = {
        betInfos,
        type: lotteryType,
        seller: lotterySellerAddress,
        multiplied,
      };
      console.log(BuyInput, '=====BuyInput');
      const buy = yield lotteryContract.Buy(BuyInput);
      yield delay(3000);
      const result = yield aelfUtils.getTxResult(buy.TransactionId);
      console.log(result, '======result');
      Loading.hide();
      OverlayModal.hide();
      CommonToast.success(i18n.t('lottery.lotterySaga.betSuccess'));
    } else {
      Loading.destroy();
      CommonToast.fail(i18n.t('lottery.lotterySaga.betFailed'));
    }
  } catch (error) {
    Loading.destroy();
    CommonToast.fail(i18n.t('lottery.lotterySaga.betFailed'));
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

      yield put(lotteryActions.getMaxMultiplied(lotteryContract, lotteryInfo));

      yield put(lotteryActions.getLotteryRewards(lotteryContract, lotteryInfo));

      yield put(lotteryActions.getLotteryCashed(lotteryContract, lotteryInfo));

      yield put(lotteryActions.getLotterySymbol(lotteryContract, lotteryInfo));

      yield put(
        lotteryActions.getLotteryDuration(lotteryContract, lotteryInfo),
      );
      const {lotterySymbol} = lotteryInfo || {};
      const lotteryBalance = yield tokenContract.GetBalance.call({
        symbol: lotterySymbol || tokenSymbol,
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
function* getMaxMultipliedSaga({lotteryContract, lotteryInfo}) {
  try {
    const result = yield lotteryContract.GetMaxMultiplied.call();
    const maxMultiplied = result?.value;
    console.log(lotteryInfo.maxMultiplied, maxMultiplied, '=====maxMultiplied');
    if (lotteryInfo.maxMultiplied !== maxMultiplied && !isNaN(maxMultiplied)) {
      yield put(lotteryActions.setMaxMultiplied(maxMultiplied));
    }
  } catch (error) {
    console.log('getCurrentPeriodSaga', error);
  }
}
function* getLotterySymbolSaga({lotteryContract, lotteryInfo}) {
  try {
    const symbol = yield lotteryContract.GetTokenSymbol.call();
    const lotterySymbol = (symbol || {}).value;
    if (lotteryInfo.lotterySymbol !== lotterySymbol) {
      yield put(lotteryActions.setLotterySymbol(lotterySymbol));
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
    const period = yield lotteryContract.GetPeriod.call({
      value: result.periodNumber,
    });
    const obj = {...result, ...period};
    if (JSON.stringify(lotteryInfo.lotteryCashed) !== JSON.stringify(obj)) {
      yield put(lotteryActions.setLotteryCashed(obj));
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
    } else {
      callBack && callBack(-1);
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
      console.log(lotteryResult, result);
      yield put(
        lotteryActions.setLottery({...(result || {}), ...(lottery || {})}),
      );
      Loading.hide();
      navigationService.navigate('Award');
    } else {
      Loading.destroy();
      CommonToast.fail('fail');
    }
  } catch (error) {
    Loading.destroy();
    CommonToast.fail('fail');
    console.log('getLotterySaga', error);
  }
}

function* takeRewardSaga({lotteryId}) {
  try {
    Loading.show();
    const userInfo = yield select(userSelectors.getUserInfo);
    const {lotteryContract} = userInfo.contracts || {};
    if (lotteryContract) {
      const reward = yield lotteryContract.TakeReward({
        lotteryId,
      });
      yield delay(3000);
      const result = yield aelfUtils.getTxResult(reward.TransactionId);
      console.log(result, '======result');
      CommonToast.success(i18n.t('lottery.lotterySaga.acceptedSuccess'));
      yield put(userActions.getUserBalance());
      yield delay(2000);
      Loading.hide();
      yield put(lotteryActions.getRewardedList());
      navigationService.goBack();
    } else {
      Loading.destroy();
      CommonToast.fail(i18n.t('lottery.lotterySaga.acceptedFailed'));
    }
  } catch (error) {
    Loading.destroy();
    CommonToast.fail(i18n.t('lottery.lotterySaga.acceptedFailed'));
    console.log('getLotterySaga', error);
  }
}
function* getPeriodListSaga({loadingPaging, callBack}) {
  try {
    const userInfo = yield select(userSelectors.getUserInfo);
    const {lotteryContract} = userInfo.contracts || {};
    if (lotteryContract) {
      const periodList = yield select(lotterySelectors.periodList);
      const {drawPeriod} = yield select(lotterySelectors.getLotteryInfo);
      let startPeriodNumber = drawPeriod?.periodNumber || 0;
      if (loadingPaging && Array.isArray(periodList)) {
        const period = periodList[periodList.length - 1];
        const {periodNumber} = period || {};
        startPeriodNumber = periodNumber ? periodNumber - 1 : startPeriodNumber;
      }
      const result = yield lotteryContract.GetPeriods.call({
        startPeriodNumber,
        limit: LOTTERY_LIMIT,
      });
      console.log(result, '=====result');
      const {periods} = result || {};
      if (Array.isArray(periods)) {
        let list = [];
        if (loadingPaging) {
          if (Array.isArray(periodList)) {
            list = list.concat(periodList);
          }
        }
        list = list.concat(periods);
        if (periods.length < LOTTERY_LIMIT) {
          callBack && callBack(0);
        } else {
          callBack && callBack(1);
        }
        yield put(lotteryActions.setPeriodList(list));
      } else {
        callBack && callBack(0);
      }
    } else {
      callBack && callBack(-1);
    }
  } catch (error) {
    console.log(error, '======getPeriodListSaga');
    callBack && callBack(-1);
  }
}
function* getRewardedListSaga({loadingPaging, callBack}) {
  try {
    const userInfo = yield select(userSelectors.getUserInfo);
    const {lotteryContract} = userInfo.contracts || {};
    if (lotteryContract) {
      const rewardedList = yield select(lotterySelectors.rewardedList);
      let offset = 0;
      if (loadingPaging && Array.isArray(rewardedList)) {
        offset = rewardedList.length;
      }
      const result = yield lotteryContract.GetRewardedLotteries.call({
        offset,
        limit: LOTTERY_LIMIT,
      });
      console.log(result, '=====result');
      const {lotteries} = result || {};
      if (Array.isArray(lotteries)) {
        let list = [];
        if (loadingPaging) {
          if (Array.isArray(rewardedList)) {
            list = list.concat(rewardedList);
          }
        }
        list = list.concat(lotteries);
        if (lotteries.length < LOTTERY_LIMIT) {
          callBack && callBack(0);
        } else {
          callBack && callBack(1);
        }
        yield put(lotteryActions.setRewardedList(list));
      } else {
        if (!loadingPaging) {
          yield put(lotteryActions.setRewardedList([]));
        }
        callBack && callBack(0);
      }
    } else {
      if (!loadingPaging) {
        yield put(lotteryActions.setRewardedList([]));
      }
      callBack && callBack(-1);
    }
  } catch (error) {
    if (!loadingPaging) {
      yield put(lotteryActions.setRewardedList([]));
    }
    callBack && callBack(-1);
    console.log(error, '======getRewardedListSaga');
  }
}
function* getRewardAmountsListSaga({callBack}) {
  try {
    const userInfo = yield select(userSelectors.getUserInfo);
    const {lotteryContract} = userInfo.contracts || {};
    if (lotteryContract) {
      const result = yield lotteryContract.GetRewardAmountsBoard.call();
      yield put(
        lotteryActions.setRewardAmountsList(result?.rewardAmountList || []),
      );
    }
    callBack?.();
  } catch (error) {
    callBack?.();
    console.log(error, '======getRewardAmountsListSaga');
  }
}
function* getPeriodCountListSaga({callBack}) {
  try {
    const userInfo = yield select(userSelectors.getUserInfo);
    const {lotteryContract} = userInfo.contracts || {};
    if (lotteryContract) {
      const result = yield lotteryContract.GetPeriodCountBoard.call();
      yield put(
        lotteryActions.setPeriodCountList(result?.periodCountList || []),
      );
    }
    callBack?.();
  } catch (error) {
    callBack?.();
    console.log(error, '======getPeriodCountListSaga');
  }
}
function* getSelfWinningInfoSaga({callBack}) {
  try {
    const userInfo = yield select(userSelectors.getUserInfo);
    const {lotteryContract} = userInfo.contracts || {};
    if (lotteryContract) {
      const self = yield Promise.all([
        lotteryContract.GetTotalRewardAmount.call(
          aelfUtils.formatRestoreAddress(userInfo?.address),
        ),
        lotteryContract.GetTotalPeriodCount.call(
          aelfUtils.formatRestoreAddress(userInfo?.address),
        ),
      ]);
      const obj = {
        amount: self?.[0]?.value,
        periodCount: self?.[1]?.value,
      };
      yield put(lotteryActions.setSelfWinningInfo(obj));
      callBack?.();
    }
  } catch (error) {
    callBack?.();
    console.log(error, '======getPeriodCountListSaga');
  }
}
export default function* SettingsSaga() {
  yield all([
    yield takeLatest(lotteryTypes.BUY, buySaga),
    yield takeLatest(lotteryTypes.INIT_LOTTERY, initLotterySaga),
    yield takeLatest(lotteryTypes.GET_DRAW_PERIOD, getDrawPeriodSaga),
    yield takeLatest(lotteryTypes.GET_CURRENT_PERIOD, getCurrentPeriodSaga),
    yield takeLatest(lotteryTypes.GET_LOTTERY_PRICE, getLotteryPriceSaga),
    yield takeLatest(lotteryTypes.GET_MAX_MULTIPLIED, getMaxMultipliedSaga),
    yield takeLatest(lotteryTypes.GET_LOTTERY_SYMBOL, getLotterySymbolSaga),
    yield takeLatest(lotteryTypes.GET_LOTTERY_REWARDS, getLotteryRewardsSaga),
    yield takeLatest(lotteryTypes.GET_LOTTERY_CASHED, getLotteryCashedSaga),
    yield takeLatest(lotteryTypes.GET_LOTTERY_DURATION, getLotteryDurationSaga),
    yield takeLatest(lotteryTypes.GET_MY_BET_LIST, getMyBetListSaga),
    yield takeLatest(lotteryTypes.GET_LOTTERY, getLotterySaga),
    yield takeLatest(lotteryTypes.TAKE_REWARD, takeRewardSaga),

    yield takeLatest(lotteryTypes.GET_PERIOD_LIST, getPeriodListSaga),
    yield takeLatest(lotteryTypes.GET_REWARDED_LIST, getRewardedListSaga),

    yield takeLatest(
      lotteryTypes.GET_SELF_WINNING_INFO,
      getSelfWinningInfoSaga,
    ),
    yield takeLatest(
      lotteryTypes.GET_REWARD_AMOUNTS_LIST,
      getRewardAmountsListSaga,
    ),
    yield takeLatest(
      lotteryTypes.GET_PERIOD_COUNT_LIST,
      getPeriodCountListSaga,
    ),
  ]);
}
