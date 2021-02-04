import React, {memo, useCallback, useRef, useState} from 'react';
import {View, StyleSheet, Image} from 'react-native';
import {
  CommonHeader,
  ListComponent,
  Touchable,
} from '../../../../components/template';
import {GStyle, Colors} from '../../../../assets/theme';
import {pTd} from '../../../../utils/common';
import {TextS, TextM} from '../../../../components/template/CommonText';
import {useDispatch} from 'react-redux';
import lotteryActions from '../../../../redux/lotteryRedux';
import lotteryUtils from '../../../../utils/pages/lotteryUtils';
import {useFocusEffect} from '@react-navigation/native';
import {useStateToProps} from '../../../../utils/pages/hooks';
import i18n from 'i18n-js';
let isActive;
const MyBet = () => {
  const list = useRef();
  const dispatch = useDispatch();
  const [loadCompleted, setLoadCompleted] = useState(true);
  const getMyBetList = useCallback(
    (loadingPaging, callBack) =>
      dispatch(lotteryActions.getMyBetList(loadingPaging, callBack)),
    [dispatch],
  );
  const getLottery = useCallback(
    (lotteryId, periodNumber) =>
      dispatch(lotteryActions.getLottery(lotteryId, periodNumber)),
    [dispatch],
  );
  const upPullRefresh = useCallback(() => {
    getMyBetList(false, v => {
      if (v === 1) {
        onSetLoadCompleted(false);
      } else {
        onSetLoadCompleted(true);
      }
      list.current && list.current.endUpPullRefresh();
      list.current && list.current.endBottomRefresh();
    });
  }, [getMyBetList, onSetLoadCompleted]);

  const onEndReached = useCallback(() => {
    getMyBetList(true, v => {
      console.log(v, '=====v');
      if (v === 1) {
        onSetLoadCompleted(false);
      } else {
        onSetLoadCompleted(true);
      }
      list.current && list.current.endBottomRefresh();
    });
  }, [getMyBetList, onSetLoadCompleted]);
  useFocusEffect(
    useCallback(() => {
      isActive = true;
      upPullRefresh();
      return () => {
        isActive = false;
      };
    }, [upPullRefresh]),
  );
  const onSetLoadCompleted = useCallback(value => {
    if (isActive) {
      setLoadCompleted(value);
    }
  }, []);
  const {myBetList, currentPeriod, language} = useStateToProps(base => {
    const {lottery, settings} = base;
    return {
      language: settings.language,
      myBetList: lottery.myBetList,
      currentPeriod: lottery.currentPeriod,
    };
  });
  const onGetLottery = useCallback(
    item => {
      const {id, periodNumber} = item;
      getLottery(id, periodNumber);
    },
    [getLottery],
  );
  const renderItem = useCallback(
    ({item}) => {
      const {
        createTime,
        startPeriodNumberOfDay,
        periodNumber,
        type,
        cashed,
        expired,
        reward,
      } = item || {};
      const noDraw = currentPeriod?.periodNumber === periodNumber;
      const rewardStyle =
        reward && reward > 0 ? styles.colorText : styles.blackText;
      return (
        <Touchable
          disabled={noDraw}
          onPress={() => onGetLottery(item)}
          style={styles.itemBox}>
          <View style={styles.leftBox}>
            <Image
              resizeMode="contain"
              style={styles.ballBox}
              source={lotteryUtils.getBetImage(type)}
            />
            <View style={styles.titleBox}>
              <TextM>{i18n.t('lottery.draw.lottery')}</TextM>
              <TextS style={styles.marginText}>
                {lotteryUtils.getBetType(type)}
              </TextS>
            </View>
          </View>
          <View style={styles.intermediateBox}>
            <TextM style={styles.intermediateText}>
              {i18n.t('lottery.first')}
              <TextM style={rewardStyle}>
                {lotteryUtils.getPeriod(
                  createTime,
                  startPeriodNumberOfDay,
                  periodNumber,
                  typeof language === 'string' && language.includes('zh')
                    ? false
                    : 2,
                )}
              </TextM>
              {i18n.t('lottery.period')}
            </TextM>
          </View>
          <View style={styles.rightBox}>
            <TextM style={[styles.rightText, rewardStyle]}>
              {lotteryUtils.getWinningSituation(
                cashed,
                expired,
                reward,
                noDraw,
              )}
            </TextM>
            <TextS style={styles.marginText}>
              {lotteryUtils.getStartMonthTime(createTime)}
            </TextS>
          </View>
        </Touchable>
      );
    },
    [currentPeriod, language, onGetLottery],
  );
  return (
    <View style={GStyle.container}>
      <CommonHeader title={i18n.t('lottery.draw.myBet')} canBack />
      <ListComponent
        ref={list}
        whetherAutomatic
        data={myBetList}
        bottomLoadTip={i18n.t('lottery.loadMore')}
        showFooter={!loadCompleted}
        loadCompleted={loadCompleted}
        renderItem={renderItem}
        upPullRefresh={upPullRefresh}
        onEndReached={onEndReached}
      />
    </View>
  );
};

export default memo(MyBet);

const styles = StyleSheet.create({
  itemBox: {
    padding: pTd(20),
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderColor,
  },
  ballBox: {
    height: pTd(100),
    width: pTd(90),
  },
  titleBox: {
    flex: 1,
    marginLeft: pTd(10),
  },
  leftBox: {
    width: '38%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  intermediateBox: {
    flexDirection: 'row',
    width: '30%',
    alignItems: 'center',
  },
  intermediateText: {
    flex: 1,
    textAlign: 'center',
  },
  rightBox: {
    flex: 1,
    alignItems: 'flex-end',
    marginLeft: pTd(20),
  },
  rightText: {
    textAlign: 'right',
  },
  colorText: {
    color: Colors.fontColor,
  },
  blackText: {
    color: Colors.fontBlack,
  },
  marginText: {
    marginTop: pTd(5),
  },
});
