import React, {memo, useCallback, useRef, useState, useEffect} from 'react';
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
import {useSelector, shallowEqual, useDispatch} from 'react-redux';
import lotteryActions, {lotterySelectors} from '../../../../redux/lotteryRedux';
import lotteryUtils from '../../../../utils/pages/lotteryUtils';
import {useFocusEffect} from '@react-navigation/native';

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
        setLoadCompleted(false);
      } else {
        setLoadCompleted(true);
      }
      list.current && list.current.endUpPullRefresh();
    });
  }, [getMyBetList]);

  const onEndReached = useCallback(() => {
    getMyBetList(true, v => {
      if (v === 1) {
        setLoadCompleted(false);
      } else {
        setLoadCompleted(true);
      }
      list.current && list.current.endBottomRefresh();
    });
  }, [getMyBetList]);
  useFocusEffect(
    useCallback(() => {
      upPullRefresh();
    }, [upPullRefresh]),
  );
  const myBetList = useSelector(lotterySelectors.myBetList, shallowEqual);
  const {currentPeriod} = useSelector(
    lotterySelectors.getLotteryInfo,
    shallowEqual,
  );
  console.log(currentPeriod, '=====currentPeriod');
  console.log(myBetList, '======myBetList');
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
      } = item;
      const noDraw = currentPeriod?.periodNumber === periodNumber;
      return (
        <Touchable
          disabled={noDraw}
          onPress={() => onGetLottery(item)}
          style={styles.itemBox}>
          <View style={styles.leftBox}>
            <Image resizeMode="contain" style={styles.ballBox} source={ball} />
            <View style={styles.titleBox}>
              <TextM>时时彩</TextM>
              <TextS style={styles.marginText}>
                {lotteryUtils.getBetType(type)}
              </TextS>
            </View>
          </View>
          <View style={styles.intermediateBox}>
            <TextM>
              第
              <TextM style={styles.colorText}>
                {lotteryUtils.getPeriod(
                  createTime,
                  startPeriodNumberOfDay,
                  periodNumber,
                )}
              </TextM>
              期
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
      <CommonHeader title="我的投注" canBack />
      <ListComponent
        ref={list}
        showFooter
        // showFooter={!loadCompleted}
        whetherAutomatic
        data={myBetList}
        allLoadedTips="加载完成"
        bottomLoadTip="点击加载更多"
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
    marginLeft: pTd(10),
  },
  leftBox: {
    width: '34%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  intermediateBox: {
    width: '40%',
    alignItems: 'center',
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
