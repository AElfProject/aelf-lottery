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
  console.log(lotteryDetails, '=====lotteryDetails');
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
      Expired,
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
          <TextS style={styles.whiteColor}>购买期数 {periods}</TextS>
          <TextS style={styles.whiteColor}>{betNumber}注</TextS>
        </View>
        <View style={styles.intermediateBox}>
          <TextComponent
            title="购买金额"
            details={`${betNumber * unitConverter.toLower(price)}金币`}
          />
          <TextComponent
            detailsStyle={reward && reward > 0 ? {} : {color: Colors.fontBlack}}
            title="中奖情况"
            details={lotteryUtils.getWinningSituation(cashed, Expired, reward)}
          />
          <TextComponent title="奖金" details={`${bonusAmount}金币`} />
        </View>
        <View style={styles.bottomBox}>
          <TextM style={styles.whiteColor}>{periods}期开奖号码</TextM>
          <TextM style={[styles.colorText, styles.numberText]}>
            {lotteryUtils.getWinningNumbers(luckyNumber)}
          </TextM>
        </View>
      </ImageBackground>
    );
  }, [lotteryDetails]);
  const {createTime, betInfos, cashed, Expired, type, id, reward} =
    lotteryDetails || {};
  const betList = lotteryUtils.getDrawBetStr(type, betInfos);
  const takeReward = useCallback(
    lotteryId => dispatch(lotteryActions.takeReward(lotteryId)),
    [dispatch],
  );
  return (
    <View style={GStyle.container}>
      <CommonHeader title="领奖" canBack>
        <View style={styles.container}>
          {CardComponent}
          <View style={styles.box}>
            <TextM style={styles.myBetText}>我的投注</TextM>
            <View style={styles.bettingBox}>
              <TextL>{lotteryUtils.getBetType(type)}</TextL>
              {betList
                ? betList.map((i, j) => {
                    const {title, bets} = i;
                    return (
                      <View key={j} style={styles.titleBox}>
                        <TextM>{title}</TextM>
                        <View style={styles.detailsBox}>
                          {bets.map((item, index) => {
                            return (
                              <TextM
                                style={{color: Colors.fontColor}}
                                key={index}>
                                {item}
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
              下单时间：{aelfUtils.timeConversion(createTime)}
            </TextS>
          </View>
          <CommonButton
            onPress={() => takeReward(id)}
            disabled={!lotteryUtils.getCanAward(cashed, Expired, reward)}
            style={styles.buttonBox}
            title="领奖"
          />
          <TextS style={[styles.timeText, styles.awardTip]}>
            领奖后可在【我的】页面查看余额
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
    marginHorizontal: pTd(100),
    justifyContent: 'space-around',
  },
});
