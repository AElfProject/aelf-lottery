import React, {memo, useState, useCallback} from 'react';
import {View, StyleSheet} from 'react-native';
import {CommonHeader, CommonToast} from '../../../../components/template';
import {GStyle, Colors} from '../../../../assets/theme';
import {TextL} from '../../../../components/template/CommonText';
import {pTd} from '../../../../utils/common';
import lotteryUtils from '../../../../utils/pages/lotteryUtils';
import BetBody from '../BetBody';
import ConfirmModal from '../ConfirmModal';
const BonusAmount = 100000;
const data = [
  {title: '十位', playList: ['大', '小', '单', '双']},
  {title: '个位', playList: ['大', '小', '单', '双']},
];
// const data = [
//   {
//     title: '万位',
//     playList: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
//   },
//   {
//     title: '千位',
//     playList: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
//   },
//   {
//     title: '百位',
//     playList: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
//   },
//   {
//     title: '十位',
//     playList: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
//   },
//   {
//     title: '个位',
//     playList: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
//   },
// ];
const BigSmallSingleDouble = () => {
  const [betList, setBetList] = useState([]);
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
    });
  }, [betList]);
  return (
    <View style={GStyle.container}>
      <CommonHeader title="大小单双" canBack />
      <TextL style={styles.tipStyle}>
        十、个位至少各选一个号码，单注选号与开奖号码按位一致即中奖 1000金币！
      </TextL>
      <BetBody
        betList={betList}
        data={data}
        onBet={onBet}
        onClear={() => setBetList([])}
        bonusAmount={BonusAmount}
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
