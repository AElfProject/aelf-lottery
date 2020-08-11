import React, {memo, useState, useCallback} from 'react';
import {View, StyleSheet} from 'react-native';
import {GStyle, Colors} from '../../../../../assets/theme';
import {TextL} from '../../../../../components/template/CommonText';
import {pTd} from '../../../../../utils/common';
import lotteryUtils from '../../../../../utils/pages/lotteryUtils';
import BetBody from '../../BetBody';
import ConfirmModal from '../../ConfirmModal';
import {LOTTERY_TYPE} from '../../../../../config/lotteryConstant';
import {useStateToProps} from '../../../../../utils/pages/hooks';
import i18n from 'i18n-js';
const lotteryType = 111;
const TwoCombinedValue = () => {
  const [data] = useState([
    {
      title: '小合值',
      playList: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    },
    {
      title: '大合值',
      playList: ['10', '11', '12', '13', '14', '15', '16', '17', '18'],
    },
  ]);
  const [betList, setBetList] = useState([]);
  const {lotteryRewards, lotteryPrice} = useStateToProps(base => {
    const {lottery} = base;
    return {
      lotteryRewards: lottery.lotteryRewards,
      lotteryPrice: lottery.lotteryPrice,
    };
  });
  const bonusAmount = 888; //中奖金额
  const onSelect = useCallback(
    (first, second) => {
      setBetList(lotteryUtils.processingNumber(betList, first, second));
    },
    [betList],
  );
  const onBet = useCallback(() => {
    ConfirmModal.show({
      title: `${i18n.t('lottery.twoStars')}${'直选合值'}`,
      data,
      betList,
      lotteryType,
      getBetNumber,
    });
  }, [betList, data, getBetNumber]);
  const disabledRule = useCallback(() => {
    return lotteryUtils.getTwoArrayLength(betList) > 0;
  }, [betList]);
  const getBetNumber = useCallback(() => {
    return lotteryUtils.getTwoArrayLength(betList) * lotteryPrice;
  }, [betList, lotteryPrice]);
  return (
    <View style={GStyle.container}>
      <TextL style={styles.tipStyle}>
        至少选择1个和值，所选和值与开奖号码后两位和值一致即中奖100金币！
      </TextL>
      <BetBody
        lineLength={10}
        betList={betList}
        data={data}
        onBet={onBet}
        onClear={() => setBetList([])}
        bonusAmount={bonusAmount}
        onSelect={onSelect}
        betComponentStyle={styles.betComponentStyle}
        disabledRule={disabledRule}
        getBetNumber={getBetNumber}
      />
    </View>
  );
};
export default memo(TwoCombinedValue);

const styles = StyleSheet.create({
  tipStyle: {
    padding: pTd(20),
    color: Colors.fontColor,
  },
  titleBox: {
    paddingVertical: pTd(20),
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderColor,
  },
  titleStyle: {
    color: Colors.fontColor,
  },
  betComponentStyle: {
    marginTop: pTd(10),
  },
});
