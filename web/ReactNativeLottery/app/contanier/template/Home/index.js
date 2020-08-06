//We need to know when we switch languages
/* eslint-disable react-hooks/exhaustive-deps */
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
import i18n from 'i18n-js';
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
const Home = () => {
  const dispatch = useDispatch();
  const {
    lotteryBalance,
    currentPeriod,
    drawPeriod,
    lotteryCashed,
    language,
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
          {i18n.t('lottery.latestDraw')}
          <TextM style={styles.colorText}>
            {lotteryUtils.getPeriod(
              createTime,
              startPeriodNumberOfDay,
              periodNumber,
            )}
          </TextM>
          {i18n.t('lottery.period')}
        </TextM>
        <WinningNumbers winningNumbers={luckyNumber} />
        <View style={styles.tipToolBox}>
          <View style={styles.toolItem}>
            <TextM>{i18n.t('lottery.threeFrom')}</TextM>
            <TextM style={styles.toolBottomText}>
              {lotteryUtils.getThreeForm(luckyNumber)
                ? i18n.t('lottery.threePackage')
                : i18n.t('lottery.sixPackage')}
            </TextM>
          </View>
          <View style={styles.toolItem}>
            <TextM>{i18n.t('lottery.threeCombined')}</TextM>
            <TextM style={styles.toolBottomText}>
              {lotteryUtils.getCombined(luckyNumber, 3)}
            </TextM>
          </View>
          <View style={styles.toolItem}>
            <TextM>{i18n.t('lottery.twoCombined')}</TextM>
            <TextM style={styles.toolBottomText}>
              {lotteryUtils.getCombined(luckyNumber, 2)}
            </TextM>
          </View>
        </View>
      </View>
    );
  }, [drawPeriod, language]);
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
          {i18n.t('lottery.current')}
          <TextM style={styles.colorText}>
            {lotteryUtils.getPeriod(
              createTime,
              startPeriodNumberOfDay,
              periodNumber,
            )}
          </TextM>
          {i18n.t('lottery.period')}
        </TextM>
        <View style={styles.currentBox}>
          <View style={styles.currentItem}>
            <MaterialIcons name="access-time" size={30} />
            <TextM style={styles.endTip}>
              {i18n.t('lottery.distanceCutoff')}
            </TextM>
            <CountDown
              key={date}
              style={styles.countDownBox}
              date={date}
              mins={i18n.t('lottery.minute')}
              segs={i18n.t('lottery.second')}
              onEnd={onEnd}
            />
          </View>
          <View style={styles.borderView} />
          <View style={styles.currentItem}>
            <Octicons name="database" size={30} />
            <TextM style={styles.endTip}>{i18n.t('lottery.prizePool')}</TextM>
            <TextL style={styles.lotteryBalance}>{lotteryBalance}</TextL>
          </View>
        </View>
      </View>
    );
  }, [currentPeriod, lotteryBalance, onEnd, language]);
  const PurchaseEntry = useMemo(() => {
    const list = [
      {
        title: i18n.t('lottery.fiveStars'),
        onPress: () => navigationService.navigate('FiveStars'),
      },
      {
        title: i18n.t('lottery.threeStars'),
        onPress: () => navigationService.navigate('ThreeStars'),
      },
      {
        title: i18n.t('lottery.twoStars'),
        onPress: () => navigationService.navigate('TwoStars'),
      },
      {
        title: i18n.t('lottery.oneStar'),
        onPress: () => navigationService.navigate('OneStar'),
      },
      {
        title: i18n.t('lottery.simple'),
        onPress: () => navigationService.navigate('BigSmallSingleDouble'),
      },
    ];
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
  }, [language]);
  const Express = useMemo(() => {
    const {createTime, startPeriodNumberOfDay, periodNumber, address, type} =
      lotteryCashed || {};
    if (lotteryCashed) {
      const express = i18n.t('lottery.express', {
        address: aelfUtils.formatAddressHide(address),
        period: lotteryUtils.getPeriod(
          createTime,
          startPeriodNumberOfDay,
          periodNumber,
        ),
        details: lotteryUtils.getBetType(type),
      });
      return (
        <WordRotation
          key={express}
          duration={20000}
          textStyle={styles.rotationText}
          bgViewStyle={styles.rotationBox}>
          {express}
        </WordRotation>
      );
    }
  }, [lotteryCashed, language]);
  return (
    <View style={GStyle.container}>
      <CommonHeader
        title={i18n.t('lottery.lottery')}
        leftTitle={i18n.t('lottery.play')}
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
