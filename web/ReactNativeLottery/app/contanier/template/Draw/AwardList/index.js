import React, {memo, useCallback, useState, useRef} from 'react';
import {View, Image, StyleSheet} from 'react-native';
import {
  CommonHeader,
  Touchable,
  ListComponent,
} from '../../../../components/template';
import {GStyle, Colors} from '../../../../assets/theme';
import {awardLogo, ball} from '../../../../assets/images';
import {pTd} from '../../../../utils/common';
import {TextM, TextS} from '../../../../components/template/CommonText';
import {useFocusEffect} from '@react-navigation/native';
import lotteryActions from '../../../../redux/lotteryRedux';
import {useDispatch} from 'react-redux';
import lotteryUtils from '../../../../utils/pages/lotteryUtils';
import {useStateToProps} from '../../../../utils/pages/hooks';
import i18n from 'i18n-js';
let isActive;
const AwardList = () => {
  const list = useRef();
  const dispatch = useDispatch();
  const [loadCompleted, setLoadCompleted] = useState(true);
  const getRewardedList = useCallback(
    (loadingPaging, callBack) =>
      dispatch(lotteryActions.getRewardedList(loadingPaging, callBack)),
    [dispatch],
  );
  const {rewardedList, currentPeriod} = useStateToProps(state => {
    const {lottery} = state;
    return {
      rewardedList: lottery.rewardedList,
      currentPeriod: lottery.currentPeriod,
    };
  });
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
  const upPullRefresh = useCallback(() => {
    getRewardedList(false, v => {
      if (v === 1) {
        onSetLoadCompleted(false);
      } else {
        onSetLoadCompleted(true);
      }
      list.current && list.current.endUpPullRefresh();
      list.current && list.current.endBottomRefresh();
    });
  }, [getRewardedList, onSetLoadCompleted]);
  const onEndReached = useCallback(() => {
    getRewardedList(true, v => {
      if (v === 1) {
        onSetLoadCompleted(false);
      } else {
        onSetLoadCompleted(true);
      }
      list.current && list.current.endBottomRefresh();
    });
  }, [getRewardedList, onSetLoadCompleted]);
  const getLottery = useCallback(
    (lotteryId, periodNumber) =>
      dispatch(lotteryActions.getLottery(lotteryId, periodNumber)),
    [dispatch],
  );
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
    [currentPeriod, onGetLottery],
  );
  return (
    <View style={GStyle.container}>
      <CommonHeader title={i18n.t('lottery.draw.awardList')} canBack />
      <Image
        resizeMode="contain"
        source={awardLogo}
        style={styles.awardLogoImage}
      />
      <TextM style={styles.tipStyle}>
        {rewardedList && rewardedList.length
          ? i18n.t('lottery.draw.winningTip')
          : i18n.t('lottery.draw.notWinningTip')}
      </TextM>
      <ListComponent
        ref={list}
        whetherAutomatic
        data={rewardedList}
        bottomLoadTip={i18n.t('lottery.loadMore')}
        message=" "
        showFooter={!loadCompleted}
        loadCompleted={loadCompleted}
        renderItem={renderItem}
        upPullRefresh={upPullRefresh}
        onEndReached={onEndReached}
      />
    </View>
  );
};

export default memo(AwardList);
const styles = StyleSheet.create({
  awardLogoImage: {
    marginTop: pTd(80),
    alignSelf: 'center',
    height: pTd(130),
  },
  tipStyle: {
    marginTop: pTd(20),
    textAlign: 'center',
  },
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
    width: '36%',
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
    width: '24%',
  },
  colorText: {
    color: Colors.fontColor,
  },
});
