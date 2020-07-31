import React, {memo, useState, useCallback} from 'react';
import {View, StyleSheet} from 'react-native';
import {CommonHeader} from '../../../../components/template';
import {GStyle, Colors} from '../../../../assets/theme';
import {TextL} from '../../../../components/template/CommonText';
import {pTd} from '../../../../utils/common';
import lotteryUtils from '../../../../utils/pages/lotteryUtils';
import BetBody from '../BetBody';
import ConfirmModal from '../ConfirmModal';
import {LOTTERY_TYPE} from '../../../../config/lotteryConstant';
import {useStateToProps} from '../../../../utils/pages/hooks';
const data = [
  {title: '十位', playList: ['大', '小', '单', '双']},
  {title: '个位', playList: ['大', '小', '单', '双']},
];
const lotteryType = LOTTERY_TYPE.SIMPLE;
const BigSmallSingleDouble = () => {
  const [betList, setBetList] = useState([]);
  const {lotteryRewards} = useStateToProps(base => {
    const {lottery} = base;
    return {
      lotteryRewards: lottery.lotteryRewards,
    };
  });
  const bonusAmount = lotteryRewards ? lotteryRewards[lotteryType] : 0;
  const onSelect = useCallback(
    (first, second) => {
      setBetList(lotteryUtils.processingNumber(betList, first, second));
    },
    [betList],
  );
  const onBet = useCallback(() => {
    ConfirmModal.show({
      title: '大小单双',
      data,
      betList,
      lotteryType,
    });
  }, [betList]);
  return (
    <View style={GStyle.container}>
      <CommonHeader title="大小单双" canBack />
      <TextL style={styles.tipStyle}>
        十、个位至少各选一个号码，单注选号与开奖号码按位一致即中奖 {bonusAmount}
        金币！
      </TextL>
      <BetBody
        betList={betList}
        data={data}
        onBet={onBet}
        onClear={() => setBetList([])}
        bonusAmount={bonusAmount}
        onSelect={onSelect}
      />
    </View>
  );
};
export default memo(BigSmallSingleDouble);

const styles = StyleSheet.create({
  tipStyle: {
    margin: pTd(20),
    color: Colors.fontColor,
  },
});
