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
const lotteryType = LOTTERY_TYPE.SIMPLE;
const BigSmallSingleDouble = () => {
  const [data] = useState([
    {
      title: i18n.t('lottery.tenPlace'),
      playList: [
        i18n.t('lottery.big'),
        i18n.t('lottery.small'),
        i18n.t('lottery.odd'),
        i18n.t('lottery.even'),
      ],
    },
    {
      title: i18n.t('lottery.onesPlace'),
      playList: [
        i18n.t('lottery.big'),
        i18n.t('lottery.small'),
        i18n.t('lottery.odd'),
        i18n.t('lottery.even'),
      ],
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
      title: i18n.t('lottery.simple'),
      data,
      betList,
      lotteryType,
    });
  }, [betList, data]);
  return (
    <View style={GStyle.container}>
      <CommonHeader title={i18n.t('lottery.simple')} canBack />
      <TextL style={styles.tipStyle}>
        {i18n.t('lottery.simpleTip')} {bonusAmount}
        {i18n.t('lottery.unit')}!
      </TextL>
      <BetBody
        betList={betList}
        data={data}
        onBet={onBet}
        lotteryType={lotteryType}
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
