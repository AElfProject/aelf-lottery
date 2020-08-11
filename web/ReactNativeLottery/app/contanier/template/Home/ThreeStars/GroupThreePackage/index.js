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
const tens = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const GroupThreePackage = () => {
  const [data] = useState([{title: '选号', playList: tens}]);
  const [betList, setBetList] = useState([]);
  const {lotteryRewards} = useStateToProps(base => {
    const {lottery} = base;
    return {
      lotteryRewards: lottery.lotteryRewards,
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
      title: `${i18n.t('lottery.threeStars')}${'组三包号'}`,
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
  const disabledRule = useCallback(() => {
    return data.every((item, index) => {
      return Array.isArray(betList[index]) && betList[index].length > 1;
    });
  }, [betList, data]);
  return (
    <View style={GStyle.container}>
      <TextL style={styles.tipStyle}>
        至少选择2个号码，开奖号码后三位为组三号且包含在选号中即中奖 320金币！
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
        disabledRule={disabledRule}
      />
    </View>
  );
};
export default memo(GroupThreePackage);

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
