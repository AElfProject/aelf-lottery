import React, {memo, useCallback, Fragment} from 'react';
import {StyleSheet, View} from 'react-native';
import {TextM, TextL} from '../../../../components/template/CommonText';
import {Colors} from '../../../../assets/theme';
import {pTd} from '../../../../utils/common';
import {ActionSheet, CommonButton} from '../../../../components/template';
import lotteryUtils from '../../../../utils/pages/lotteryUtils';
import {useStateToProps} from '../../../../utils/pages/hooks';
import i18n from 'i18n-js';
import {LOTTERY_TYPE} from '../../../../config/lotteryConstant';
import {bottomBarHeigth, isIphoneX} from '../../../../utils/common/device';
import navigationService from '../../../../utils/common/navigationService';
import AntDesign from 'react-native-vector-icons/AntDesign';
const ShowBetComponent = props => {
  const {lotteryPrice, address} = useStateToProps(base => {
    const {lottery, user} = base;
    return {
      address: user.address,
      lotteryPrice: lottery.lotteryPrice,
    };
  });
  const {
    betList,
    data,
    onClear,
    onBet,
    bonusAmount,
    betComponentStyle,
    lotteryType,
    multiplied,
  } = props;
  const betNumber = lotteryUtils.getBetNumber(data, betList);
  const betValue = lotteryUtils.getBetValue(
    betNumber,
    lotteryPrice,
    multiplied,
  );
  const disabled = data.every((item, index) => {
    return (
      Array.isArray(betList[index]) && betList[index].length > 0 && multiplied
    );
  });
  let Amount = bonusAmount * multiplied;
  let profit = (Amount || 1) - betValue;
  if (lotteryType === LOTTERY_TYPE.SIMPLE && disabled) {
    const {A, P} = lotteryUtils.getSimpleAmount(
      bonusAmount,
      betList,
      betValue,
      multiplied,
    );
    Amount = A;
    profit = P;
  }
  const onAlert = useCallback(() => {
    ActionSheet.alert(i18n.t('toLogin'), i18n.t('toLoginTip'), [
      {title: i18n.t('cancel'), type: 'cancel'},
      {
        title: i18n.t('determine'),
        onPress: () => {
          navigationService.reset('Entrance');
        },
      },
    ]);
  }, []);
  return (
    <View style={[styles.bottomBox, betComponentStyle]}>
      <View style={styles.textBox}>
        <TextL style>
          {i18n.t('lottery.currentlySelected')}&nbsp;
          <TextL style={styles.colorText}>{betNumber}</TextL>
          &nbsp;
          {i18n.t('lottery.note')},&nbsp;
          <TextL style={styles.colorText}>×{multiplied}</TextL>&nbsp;
          {i18n.t('lottery.times')}, {i18n.t('lottery.total')}&nbsp;
          <TextL style={styles.colorText}>{betValue}</TextL>
          &nbsp;
          {i18n.t('lottery.unit')}
        </TextL>
        <TextM style={styles.winningTip}>
          {i18n.t('lottery.winningTip', {
            bonusAmount: betNumber === 0 ? 0 : Amount,
            profit: betNumber === 0 ? 0 : profit,
          })}
        </TextM>
      </View>
      <View style={styles.container}>
        <View style={styles.showBox}>
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
                          &nbsp;]
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
        <TextL onPress={onClear} style={styles.clearBox}>
          <AntDesign size={pTd(35)} name={'delete'} />
          {i18n.t('lottery.clearSelection')}
        </TextL>
        <CommonButton
          disabled={!disabled}
          onPress={!address ? onAlert : onBet}
          title={i18n.t('lottery.order')}
          style={styles.buttonStyle}
        />
      </View>
    </View>
  );
};
export default memo(ShowBetComponent);

const styles = StyleSheet.create({
  textBox: {
    paddingHorizontal: pTd(20),
  },
  bottomBox: {
    marginTop: pTd(80),
    marginHorizontal: pTd(20),
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorText: {
    color: Colors.fontColor,
  },
  winningTip: {
    marginVertical: pTd(20),
    color: Colors.fontGray,
  },
  showBox: {
    minHeight: pTd(300),
    width: '100%',
    borderColor: Colors.borderColor,
    borderWidth: 1,
    padding: pTd(30),
  },
  itemBox: {
    paddingVertical: pTd(5),
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonStyle: {
    marginTop: pTd(50),
    marginBottom: isIphoneX ? bottomBarHeigth : 20,
    width: '50%',
  },
  container: {
    width: '89%',
    alignItems: 'center',
  },
  clearBox: {
    marginTop: pTd(10),
    alignSelf: 'flex-end',
    textAlign: 'right',
    color: Colors.fontGray,
  },
});
