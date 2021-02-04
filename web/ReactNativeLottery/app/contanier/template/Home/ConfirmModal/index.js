'use strict';

import React, {useCallback, Fragment} from 'react';
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
import {useDispatch} from 'react-redux';
import lotteryActions from '../../../../redux/lotteryRedux';
import TransactionVerification from '../../../../utils/pages/TransactionVerification';
import navigationService from '../../../../utils/common/navigationService';
import {useStateToProps} from '../../../../utils/pages/hooks';
import i18n from 'i18n-js';
const Component = props => {
  const dispatch = useDispatch();
  const buy = useCallback(data => dispatch(lotteryActions.buy(data)), [
    dispatch,
  ]);
  const {lotteryPrice, balance, address} = useStateToProps(base => {
    const {user, lottery} = base;
    return {
      lotteryPrice: lottery.lotteryPrice,
      balance: user.balance,
      address: user.address,
    };
  });
  const {data, betList, title, lotteryType, multiplied} = props;
  const betNumber = lotteryUtils.getBetNumber(data, betList);
  const betValue = lotteryUtils.getBetValue(
    betNumber,
    lotteryPrice,
    multiplied,
  );
  const onBuy = useCallback(() => {
    if (betValue > balance) {
      return CommonToast.fail(i18n.t('lottery.insufficientBalance'));
    }
    TransactionVerification.show(value => {
      value && buy({lotteryType, betList, multiplied});
    });
  }, [balance, betList, betValue, buy, lotteryType, multiplied]);
  return (
    <View style={styles.sheetBox}>
      <View style={styles.topBox}>
        <TextL style={styles.titleStyle}>
          {i18n.t('lottery.betCombination')}
        </TextL>
        <Touchable onPress={() => OverlayModal.hide()} style={styles.iconStyle}>
          <FontAwesome name="close" color={Colors.fontGray} size={pTd(50)} />
        </Touchable>
        <View style={styles.showBox}>
          <TextL style={styles.titleText}>{title}</TextL>
          {Array.isArray(data)
            ? data.map((item, index) => {
                if (Array.isArray(betList[index]) && betList[index].length) {
                  return (
                    <Fragment key={index}>
                      <View key={index} style={styles.itemBox}>
                        <TextM>
                          {item.title} [&nbsp;
                          {betList[index].map((i, j) => {
                            let text = item.playList[i];
                            if (j !== 0) {
                              text = `/${text}`;
                            }
                            return text;
                          })}
                          &nbsp; ]
                        </TextM>
                      </View>
                      {index === data.length - 1 && (
                        <View style={styles.itemBox}>
                          <TextM>{i18n.t('lottery.Times')}&nbsp;</TextM>
                          <TextM style={styles.multiplied}>
                            [&nbsp;×{multiplied}&nbsp;]
                          </TextM>
                        </View>
                      )}
                    </Fragment>
                  );
                }
              })
            : null}
        </View>
      </View>
      <View style={styles.betBox}>
        <TextL>
          {i18n.t('lottery.consumption')}
          {'   '}
          <TextL style={styles.colorText}>{betValue}</TextL>
          {'    '}
          {i18n.t('lottery.unit')}
        </TextL>
        <TextM style={styles.balanceStyle}>
          {i18n.t('lottery.accountBalance')}
          {balance}
          {i18n.t('lottery.unit')}
        </TextM>
        <View style={styles.bottomBox}>
          <TextL style={[styles.recharge, styles.hideRecharge]}>
            {i18n.t('lottery.recharge')}
          </TextL>
          <CommonButton
            disabled={betValue > balance}
            onPress={onBuy}
            title={i18n.t('lottery.confirmPayment')}
            style={styles.buttonBox}
          />
          <TextL
            onPress={() => {
              if (address) {
                OverlayModal.hide();
                navigationService.navigate('Receive');
              }
            }}
            style={styles.recharge}>
            {i18n.t('lottery.recharge')}
          </TextL>
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
