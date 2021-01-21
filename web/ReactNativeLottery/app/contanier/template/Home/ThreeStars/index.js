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
import i18n from 'i18n-js';
const lotteryType = LOTTERY_TYPE.THREE_BIT;
const ThreeStars = () => {
  const [data] = useState([
    {
      title: i18n.t('lottery.hundreds'),
      playList: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    },
    {
      title: i18n.t('lottery.tenPlace'),
      playList: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    },
    {
      title: i18n.t('lottery.onesPlace'),
      playList: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    },
  ]);
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
      title: `${i18n.t('lottery.threeStars')}${i18n.t(
        'lottery.directElection',
      )}`,
      data,
      betList,
      lotteryType,
    });
  }, [betList, data]);
  const onTool = useCallback(
    (first, type) => {
      const list = lotteryUtils.processingTool(data, betList, first, type);
      list && setBetList(list);
    },
    [betList, data],
  );
  return (
    <View style={GStyle.container}>
      <CommonHeader title={i18n.t('lottery.threeStars')} canBack>
        <View style={styles.titleBox}>
          <TextL style={styles.titleStyle}>
            {i18n.t('lottery.directElection')}
          </TextL>
        </View>
        <TextL style={styles.tipStyle}>
          {i18n.t('lottery.threeStarsTip')}
          {bonusAmount}
          {i18n.t('lottery.unit')}
        </TextL>
        <BetBody
          onTool={onTool}
          betList={betList}
          data={data}
          onBet={onBet}
          onClear={() => setBetList([])}
          bonusAmount={bonusAmount}
          onSelect={onSelect}
          betComponentStyle={styles.betComponentStyle}
        />
      </CommonHeader>
    </View>
  );
};
export default memo(ThreeStars);

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
