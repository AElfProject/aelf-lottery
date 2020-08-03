import React, {memo, useCallback, useRef, useState} from 'react';
import {View, StyleSheet, Image} from 'react-native';
import {
  CommonHeader,
  ListComponent,
  Touchable,
} from '../../../../components/template';
import {GStyle, Colors} from '../../../../assets/theme';
import {ball} from '../../../../assets/images';
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
  const [loadCompleted, setLoadCompleted] = useState(false);
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
  const {myBetList, currentPeriod} = useStateToProps(base => {
    const {lottery} = base;
    return {
      myBetList: lottery.myBetList,
      currentPeriod: lottery.currentPeriod,
    };
  });
  console.log(currentPeriod, '=====currentPeriod');
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
        Expired,
        reward,
      } = item || {};
      const noDraw = currentPeriod?.periodNumber === periodNumber;
      return (
        <Touchable
          disabled={noDraw}
          onPress={() => onGetLottery(item)}
          style={styles.itemBox}>
          <View style={styles.leftBox}>
            <Image resizeMode="contain" style={styles.ballBox} source={ball} />
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
              <TextM style={styles.colorText}>
                {lotteryUtils.getPeriod(
                  createTime,
                  startPeriodNumberOfDay,
                  periodNumber,
                )}
              </TextM>
              {i18n.t('lottery.period')}
            </TextM>
          </View>
          <View style={styles.rightBox}>
            <TextM style={reward && reward > 0 ? styles.colorText : {}}>
              {lotteryUtils.getWinningSituation(
                cashed,
                Expired,
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
    [currentPeriod, onGetLottery],
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
    width: pTd(100),
  },
  titleBox: {
    flex: 1,
    marginLeft: pTd(10),
  },
  leftBox: {
    width: '34%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  intermediateBox: {
    flexDirection: 'row',
    width: '40%',
    alignItems: 'center',
  },
  intermediateText: {
    flex: 1,
  },
  rightBox: {
    alignItems: 'flex-end',
    width: '26%',
  },
  colorText: {
    color: Colors.fontColor,
  },
  marginText: {
    marginTop: pTd(5),
  },
});
