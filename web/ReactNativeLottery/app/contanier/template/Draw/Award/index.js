import React, {memo, useMemo, useCallback} from 'react';
import {View, ImageBackground, StyleSheet} from 'react-native';
import {CommonHeader, CommonButton} from '../../../../components/template';
import {GStyle, Colors} from '../../../../assets/theme';
import {drawBG} from '../../../../assets/images';
import {pTd} from '../../../../utils/common';
import {TextM, TextS, TextL} from '../../../../components/template/CommonText';
import {pixelSize} from '../../../../utils/common/device';
import {useDispatch} from 'react-redux';
import lotteryActions from '../../../../redux/lotteryRedux';
import lotteryUtils from '../../../../utils/pages/lotteryUtils';
import unitConverter from '../../../../utils/pages/unitConverter';
import aelfUtils from '../../../../utils/pages/aelfUtils';
import {useFocusEffect} from '@react-navigation/native';
import {useStateToProps} from '../../../../utils/pages/hooks';
import i18n from 'i18n-js';
import {LOTTERY_TYPE} from '../../../../config/lotteryConstant';
const tens = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const TextComponent = memo(props => {
  const {title, details, detailsStyle} = props;
  return (
    <View style={styles.TextBox}>
      <TextM style={styles.whiteColor}>{title}</TextM>
      <TextM style={[styles.colorText, styles.detailsText, detailsStyle]}>
        {details}
      </TextM>
    </View>
  );
});
const Award = () => {
  const {lotteryDetails} = useStateToProps(base => {
    const {lottery} = base;
    return {
      lotteryDetails: lottery.lotteryDetails,
    };
  });
  const simples = [
    i18n.t('lottery.big'),
    i18n.t('lottery.small'),
    i18n.t('lottery.odd'),
    i18n.t('lottery.even'),
  ];
  const dispatch = useDispatch();
  const setLottery = useCallback(
    lottery => dispatch(lotteryActions.setLottery(lottery)),
    [dispatch],
  );
  useFocusEffect(
    useCallback(() => {
      return () => {
        setLottery(null);
      };
    }, [setLottery]),
  );
  const CardComponent = useMemo(() => {
    const {
      createTime,
      startPeriodNumberOfDay,
      periodNumber,
      betInfos,
      cashed,
      expired,
      price,
      luckyNumber,
      reward,
    } = lotteryDetails || {};
    const betNumber = lotteryUtils.getDrawBetNumber(betInfos);
    const bonusAmount = unitConverter.toLower(reward);
    const periods = lotteryUtils.getPeriod(
      createTime,
      startPeriodNumberOfDay,
      periodNumber,
    );
    return (
      <ImageBackground
        resizeMode="stretch"
        source={drawBG}
        style={styles.drawBG}>
        <View style={styles.topBox}>
          <TextS style={styles.whiteColor}>
            {i18n.t('lottery.draw.purchasePeriod')} {periods}
          </TextS>
          <TextS style={styles.whiteColor}>
            {betNumber}
            {i18n.t('lottery.note')}
          </TextS>
        </View>
        <View style={styles.intermediateBox}>
          <TextComponent
            title={i18n.t('lottery.draw.purchasingPrice')}
            details={`${betNumber * unitConverter.toLower(price)}${i18n.t(
              'lottery.unit',
            )}`}
          />
          <TextComponent
            detailsStyle={reward && reward > 0 ? {} : {color: Colors.fontBlack}}
            title={i18n.t('lottery.draw.winningSituation')}
            details={lotteryUtils.getWinningSituation(cashed, expired, reward)}
          />
          <TextComponent
            title={i18n.t('lottery.draw.bonus')}
            details={`${bonusAmount}${i18n.t('lottery.unit')}`}
          />
        </View>
        <View style={styles.bottomBox}>
          <TextM style={styles.whiteColor}>
            {periods}
            {i18n.t('lottery.draw.lotteryNumbers')}
          </TextM>
          <TextM style={[styles.colorText, styles.numberText]}>
            {lotteryUtils.getWinningNumbers(luckyNumber)}
          </TextM>
        </View>
      </ImageBackground>
    );
  }, [lotteryDetails]);
  const {createTime, betInfos, cashed, type, expired, id, reward} =
    lotteryDetails || {};
  const betList = lotteryUtils.getDrawBetStr(type, betInfos);
  const takeReward = useCallback(
    lotteryId => dispatch(lotteryActions.takeReward(lotteryId)),
    [dispatch],
  );
  const simple = type === LOTTERY_TYPE.SIMPLE;
  const list = simple ? simples : tens;
  return (
    <View style={GStyle.container}>
      <CommonHeader title={i18n.t('lottery.draw.receive')} canBack>
        <View style={styles.container}>
          {CardComponent}
          <View style={styles.box}>
            <TextM style={styles.myBetText}>
              {i18n.t('lottery.draw.myBet')}
            </TextM>
            <View style={styles.bettingBox}>
              <TextL>{lotteryUtils.getBetType(type)}</TextL>
              {betList
                ? betList.map((i, j) => {
                    const {title, bets} = i;
                    return (
                      <View key={j} style={styles.titleBox}>
                        <TextM>{title}</TextM>
                        <View style={styles.detailsBox}>
                          {list.map((item, index) => {
                            console.log(item, '=====item');
                            console.log(bets, '=====bets');
                            const style =
                              Array.isArray(bets) && bets.includes(item)
                                ? {color: Colors.fontColor}
                                : {};
                            return (
                              <TextM style={style} key={index}>
                                {simple ? item : lotteryUtils.padLeft(item, 2)}
                              </TextM>
                            );
                          })}
                        </View>
                      </View>
                    );
                  })
                : null}
            </View>
            <TextS style={styles.timeText}>
              {i18n.t('lottery.draw.orderTime')}
              {aelfUtils.timeConversion(createTime)}
            </TextS>
          </View>
          <CommonButton
            onPress={() => takeReward(id)}
            disabled={!lotteryUtils.getCanAward(cashed, expired, reward)}
            style={styles.buttonBox}
            title={i18n.t('lottery.draw.receive')}
          />
          <TextS style={[styles.timeText, styles.awardTip]}>
            {i18n.t('lottery.draw.receiveTip')}
          </TextS>
        </View>
      </CommonHeader>
    </View>
  );
};

export default memo(Award);

const styles = StyleSheet.create({
  drawBG: {
    padding: pTd(50),
  },
  container: {
    padding: pTd(40),
  },
  topBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: pTd(20),
    borderBottomColor: 'white',
    borderBottomWidth: pixelSize,
  },
  whiteColor: {
    color: 'white',
  },
  colorText: {
    color: '#F8CF10',
  },
  intermediateBox: {
    paddingVertical: pTd(20),
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: pixelSize,
    borderBottomColor: 'white',
  },
  TextBox: {
    flex: 1,
    alignItems: 'center',
  },
  detailsText: {
    marginTop: pTd(20),
  },
  bottomBox: {
    paddingTop: pTd(40),
    alignItems: 'center',
  },
  numberText: {
    letterSpacing: pTd(20),
    marginTop: pTd(20),
  },
  bettingBox: {
    paddingVertical: pTd(20),
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderColor,
  },
  timeText: {
    marginTop: pTd(30),
  },
  box: {
    marginTop: pTd(30),
  },
  myBetText: {
    fontWeight: 'bold',
    marginBottom: pTd(20),
  },
  buttonBox: {
    width: '70%',
    marginTop: pTd(200),
  },
  awardTip: {
    textAlign: 'center',
  },
  titleBox: {
    marginLeft: pTd(50),
    flexDirection: 'row',
    marginTop: pTd(20),
  },
  detailsBox: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});
