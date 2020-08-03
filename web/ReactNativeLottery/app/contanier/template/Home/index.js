import React, {memo, useMemo, useCallback} from 'react';
import {
  CommonHeader,
  WordRotation,
  CountDown,
  Touchable,
  WinningNumbers,
} from '../../../components/template';
import {ScrollView, View, Image} from 'react-native';
import {useDispatch} from 'react-redux';
import {GStyle} from '../../../assets/theme';
import styles from './styles';
import {TextL, TextM} from '../../../components/template/CommonText';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Octicons from 'react-native-vector-icons/Octicons';
import navigationService from '../../../utils/common/navigationService';
import {ball} from '../../../assets/images';
import lotteryActions from '../../../redux/lotteryRedux';
import lotteryUtils from '../../../utils/pages/lotteryUtils';
import {LOTTERY_TIME} from '../../../config/lotteryConstant';
import aelfUtils from '../../../utils/pages/aelfUtils';
import {useStateToProps} from '../../../utils/pages/hooks';
const list = [
  {title: '五星', onPress: () => navigationService.navigate('FiveStars')},
  {title: '三星', onPress: () => navigationService.navigate('ThreeStars')},
  {title: '二星', onPress: () => navigationService.navigate('TwoStars')},
  {title: '一星', onPress: () => navigationService.navigate('OneStar')},
  {
    title: '大小单双',
    onPress: () => navigationService.navigate('BigSmallSingleDouble'),
  },
];
const Home = () => {
  const dispatch = useDispatch();
  const {
    lotteryBalance,
    currentPeriod,
    drawPeriod,
    lotteryCashed,
  } = useStateToProps(base => {
    const {settings, lottery} = base;
    return {
      language: settings.language,
      lotteryBalance: lottery.lotteryBalance,
      currentPeriod: lottery.currentPeriod,
      drawPeriod: lottery.drawPeriod,
      lotteryCashed: lottery.lotteryCashed,
    };
  });
  const initLottery = useCallback(
    () => dispatch(lotteryActions.initLottery()),
    [dispatch],
  );
  const getMyBetList = useCallback(
    () => dispatch(lotteryActions.getMyBetList()),
    [dispatch],
  );
  const getPeriodList = useCallback(
    () => dispatch(lotteryActions.getPeriodList()),
    [dispatch],
  );
  const LatestDraw = useMemo(() => {
    const {createTime, startPeriodNumberOfDay, periodNumber, luckyNumber} =
      drawPeriod || {};
    return (
      <View style={styles.box}>
        <TextM style={styles.textStyle}>
          最新开奖第
          <TextM style={styles.colorText}>
            {lotteryUtils.getPeriod(
              createTime,
              startPeriodNumberOfDay,
              periodNumber,
            )}
          </TextM>
          期
        </TextM>
        <WinningNumbers winningNumbers={luckyNumber} />
        <View style={styles.tipToolBox}>
          <View style={styles.toolItem}>
            <TextM>三星形态</TextM>
            <TextM style={styles.toolBottomText}>
              {lotteryUtils.getThreeForm(luckyNumber) ? '包三' : '包六'}
            </TextM>
          </View>
          <View style={styles.toolItem}>
            <TextM>三星合值</TextM>
            <TextM style={styles.toolBottomText}>
              {lotteryUtils.getCombined(luckyNumber, 3)}
            </TextM>
          </View>
          <View style={styles.toolItem}>
            <TextM>二星合值</TextM>
            <TextM style={styles.toolBottomText}>
              {lotteryUtils.getCombined(luckyNumber, 2)}
            </TextM>
          </View>
        </View>
      </View>
    );
  }, [drawPeriod]);
  const onEnd = useCallback(() => {
    initLottery();
    getMyBetList();
    getPeriodList();
  }, [getMyBetList, getPeriodList, initLottery]);
  const CurrentDraw = useMemo(() => {
    const {createTime, startPeriodNumberOfDay, periodNumber} =
      currentPeriod || {};
    const {seconds} = createTime || {};
    const date = seconds ? Number(seconds + '000') + LOTTERY_TIME : 0;
    return (
      <View style={styles.box}>
        <TextM style={styles.textStyle}>
          当前第
          <TextM style={styles.colorText}>
            {lotteryUtils.getPeriod(
              createTime,
              startPeriodNumberOfDay,
              periodNumber,
            )}
          </TextM>
          期
        </TextM>
        <View style={styles.currentBox}>
          <View style={styles.currentItem}>
            <MaterialIcons name="access-time" size={30} />
            <TextM style={styles.endTip}>距离购买截止</TextM>
            <CountDown
              key={date}
              style={styles.countDownBox}
              date={date}
              mins="分"
              segs="秒"
              onEnd={onEnd}
            />
          </View>
          <View style={styles.borderView} />
          <View style={styles.currentItem}>
            <Octicons name="database" size={30} />
            <TextM style={styles.endTip}>奖池</TextM>
            <TextL style={styles.lotteryBalance}>{lotteryBalance}</TextL>
          </View>
        </View>
      </View>
    );
  }, [currentPeriod, lotteryBalance, onEnd]);
  const PurchaseEntry = useMemo(() => {
    return (
      <View style={styles.bottomBox}>
        {list.map((item, index) => {
          return (
            <Touchable
              onPress={item.onPress}
              style={styles.bottomItem}
              key={index}>
              <Image
                resizeMode="contain"
                style={styles.ballBox}
                source={ball}
              />
              <TextL style={styles.bottomText}>{item.title}</TextL>
            </Touchable>
          );
        })}
      </View>
    );
  }, []);
  const Express = useMemo(() => {
    const {createTime, startPeriodNumberOfDay, periodNumber, address, type} =
      lotteryCashed || {};
    if (lotteryCashed) {
      const express = `快报 恭喜${aelfUtils.formatAddressHide(
        address,
      )}成功领取第${lotteryUtils.getPeriod(
        createTime,
        startPeriodNumberOfDay,
        periodNumber,
      )}期 ${lotteryUtils.getBetType(type)}`;
      return (
        <WordRotation
          key={express}
          textStyle={styles.rotationText}
          bgViewStyle={styles.rotationBox}>
          {express}
        </WordRotation>
      );
    }
  }, [lotteryCashed]);
  return (
    <View style={GStyle.container}>
      <CommonHeader
        title={'欢乐时时彩'}
        leftTitle={'玩法'}
        leftOnPress={() => navigationService.navigate('HowToPlay')}
      />
      {Express}
      <ScrollView>
        <View style={GStyle.container}>
          {LatestDraw}
          {CurrentDraw}
          {PurchaseEntry}
        </View>
      </ScrollView>
    </View>
  );
};
export default memo(Home);
