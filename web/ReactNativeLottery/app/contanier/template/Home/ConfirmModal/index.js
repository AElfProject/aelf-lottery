'use strict';

import React, {useCallback} from 'react';
import {View, StyleSheet} from 'react-native';
import {statusBarHeight, getWindowWidth} from '../../../../utils/common/device';
import {
  OverlayModal,
  Touchable,
  CommonButton,
  CommonToast,
} from '../../../../components/template';
import {TextL, TextM} from '../../../../components/template/CommonText';
import {pTd} from '../../../../utils/common';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {Colors} from '../../../../assets/theme';
import lotteryUtils from '../../../../utils/pages/lotteryUtils';
import {userSelectors} from '../../../../redux/userRedux';
import {shallowEqual, useSelector, useDispatch} from 'react-redux';
import lotteryActions, {lotterySelectors} from '../../../../redux/lotteryRedux';
import TransactionVerification from '../../../../utils/pages/TransactionVerification';
const Component = props => {
  const dispatch = useDispatch();
  const buy = useCallback(data => dispatch(lotteryActions.buy(data)), [
    dispatch,
  ]);
  const lotteryInfo = useSelector(
    lotterySelectors.getLotteryInfo,
    shallowEqual,
  );
  const balance = useSelector(userSelectors.getBalance, shallowEqual);
  const {data, betList, title, lotteryType} = props;
  const betNumber = lotteryUtils.getBetNumber(data, betList);
  const betValue = lotteryUtils.getBetValue(
    betNumber,
    lotteryInfo?.lotteryPrice,
  );
  const onBuy = useCallback(() => {
    if (betValue > balance) {
      return CommonToast.fail('余额不足');
    }
    TransactionVerification.show(value => {
      value && buy({lotteryType, betList});
    });
  }, [balance, betList, betValue, buy, lotteryType]);
  return (
    <View style={styles.sheetBox}>
      <View style={styles.topBox}>
        <TextL style={styles.titleStyle}>当前投注组合</TextL>
        <Touchable onPress={() => OverlayModal.hide()} style={styles.iconStyle}>
          <FontAwesome name="close" color={Colors.fontGray} size={pTd(50)} />
        </Touchable>
        <View style={styles.showBox}>
          <TextL style={styles.titleText}>{title}</TextL>
          {Array.isArray(data)
            ? data.map((item, index) => {
                if (Array.isArray(betList[index]) && betList[index].length) {
                  return (
                    <View key={index} style={styles.itemBox}>
                      <TextM>
                        {item.title} [{' '}
                        {betList[index].map((i, j) => {
                          let text = item.playList[i];
                          if (j !== 0) {
                            text = `/${text}`;
                          }
                          return text;
                        })}{' '}
                        ]
                      </TextM>
                    </View>
                  );
                }
              })
            : null}
        </View>
      </View>
      <View style={styles.betBox}>
        <TextL>
          本次消耗{'   '}
          <TextL style={styles.colorText}>{betValue}</TextL>
          {'    '} 金币
        </TextL>
        <TextM style={styles.balanceStyle}>账户余额{balance}金币</TextM>
        <View style={styles.bottomBox}>
          <TextL style={[styles.recharge, styles.hideRecharge]}>充值</TextL>
          <CommonButton
            disabled={betValue > balance}
            onPress={onBuy}
            title="确认支付"
            style={styles.buttonBox}
          />
          <TextL style={styles.recharge}>充值</TextL>
        </View>
      </View>
    </View>
  );
};
/**
 * show
 * @param  {Array}   items      [Menu array]
 * @param  {object}  cancelItem [cancel]
 */
const show = params => {
  OverlayModal.show(<Component {...params} />, {
    style: styles.bgStyle,
    containerStyle: styles.containerStyle,
    // modal: true,
    type: 'zoomOut',
  });
};
export default {
  show,
};
const styles = StyleSheet.create({
  titleStyle: {
    alignSelf: 'center',
  },
  iconStyle: {
    padding: pTd(20),
    position: 'absolute',
    right: pTd(10),
    top: pTd(20),
  },
  bgStyle: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerStyle: {
    marginBottom: statusBarHeight,
  },
  topBox: {
    padding: pTd(30),
  },
  sheetBox: {
    justifyContent: 'space-between',
    width: getWindowWidth() * 0.85,
    minHeight: '50%',
    overflow: 'hidden',
    borderRadius: 5,
    backgroundColor: 'white',
  },
  showBox: {
    marginTop: pTd(100),
    padding: pTd(30),
  },
  itemBox: {
    paddingVertical: pTd(5),
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleText: {
    fontWeight: 'bold',
    marginBottom: pTd(20),
  },
  betBox: {
    width: '100%',
    marginTop: pTd(100),
    alignItems: 'center',
  },
  colorText: {
    color: Colors.fontColor,
  },
  hideRecharge: {
    color: 'white',
  },
  balanceStyle: {
    marginTop: pTd(30),
  },
  bottomBox: {
    flexDirection: 'row',
    width: '100%',
    marginVertical: pTd(20),
    paddingVertical: pTd(20),
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.borderColor,
  },
  buttonBox: {
    height: 40,
    width: '45%',
  },
  recharge: {
    marginHorizontal: pTd(40),
  },
});
