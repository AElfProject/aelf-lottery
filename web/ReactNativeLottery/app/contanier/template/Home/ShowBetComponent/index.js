import React, {memo} from 'react';
import {StyleSheet, View} from 'react-native';
import {TextM, TextL} from '../../../../components/template/CommonText';
import {Colors} from '../../../../assets/theme';
import {pTd} from '../../../../utils/common';
import {CommonButton} from '../../../../components/template';
import lotteryUtils from '../../../../utils/pages/lotteryUtils';
import {useSelector, shallowEqual} from 'react-redux';
import {lotterySelectors} from '../../../../redux/lotteryRedux';
const ShowBetComponent = props => {
  const lotteryInfo = useSelector(
    lotterySelectors.getLotteryInfo,
    shallowEqual,
  );
  const {betList, data, onClear, onBet, bonusAmount} = props;
  const betNumber = lotteryUtils.getBetNumber(data, betList);
  const betValue = lotteryUtils.getBetValue(
    betNumber,
    lotteryInfo?.lotteryPrice,
  );
  const disabled = data.every((item, index) => {
    return Array.isArray(betList[index]) && betList[index].length > 0;
  });
  return (
    <View style={styles.bottomBox}>
      <TextL>
        您当前选择了<TextL style={styles.colorText}>{betNumber}</TextL>
        注, 共<TextL style={styles.colorText}>{betValue}</TextL>
        金币
      </TextL>
      <TextM style={styles.winningTip}>
        如果中奖, 奖金金额为{bonusAmount}, 盈利{bonusAmount - betValue}
      </TextM>
      <View style={styles.container}>
        <View style={styles.showBox}>
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
        <TextL onPress={onClear} style={styles.clearBox}>
          清除选号
        </TextL>
        <CommonButton
          disabled={!disabled}
          onPress={onBet}
          title="下单"
          style={styles.buttonStyle}
        />
      </View>
    </View>
  );
};
export default memo(ShowBetComponent);

const styles = StyleSheet.create({
  bottomBox: {
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
    width: '50%',
  },
  container: {
    width: '85%',
    alignItems: 'center',
  },
  clearBox: {
    marginTop: pTd(10),
    alignSelf: 'flex-end',
    textAlign: 'right',
  },
});
