import React, {memo, useState, useCallback} from 'react';
import {View, StyleSheet} from 'react-native';
import {CommonHeader} from '../../../../components/template';
import {GStyle, Colors} from '../../../../assets/theme';
import {TextL} from '../../../../components/template/CommonText';
import {pTd} from '../../../../utils/common';
import lotteryUtils from '../../../../utils/pages/lotteryUtils';
import BetBody from '../BetBody';
import ConfirmModal from '../ConfirmModal';
const BonusAmount = 100000;
const data = [
  {
    title: '万位',
    playList: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
  },
  {
    title: '千位',
    playList: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
  },
  {
    title: '百位',
    playList: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
  },
  {
    title: '十位',
    playList: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
  },
  {
    title: '个位',
    playList: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
  },
];
const FiveStars = () => {
  const [betList, setBetList] = useState([]);
  const onSelect = useCallback(
    (first, second) => {
      setBetList(lotteryUtils.processingNumber(betList, first, second));
    },
    [betList],
  );
  const onBet = useCallback(() => {
    ConfirmModal.show({
      title: '五星直选',
      data,
      betList,
    });
  }, [betList]);
  const onTool = useCallback(
    (first, type) => {
      const list = lotteryUtils.processingTool(data, betList, first, type);
      list && setBetList(list);
    },
    [betList],
  );
  return (
    <View style={GStyle.container}>
      <CommonHeader title="五星" canBack>
        <View style={styles.titleBox}>
          <TextL style={styles.titleStyle}>直选</TextL>
        </View>
        <TextL style={styles.tipStyle}>
          万、千、百、十、个位至少各选一个号码，单注选号与开奖号码按位一致即中奖
        </TextL>
        <BetBody
          onTool={onTool}
          betList={betList}
          data={data}
          onBet={onBet}
          onClear={() => setBetList([])}
          bonusAmount={BonusAmount}
          onSelect={onSelect}
        />
      </CommonHeader>
    </View>
  );
};
export default memo(FiveStars);

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
});
