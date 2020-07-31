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
let isActive;
const AwardList = () => {
  const list = useRef();
  const dispatch = useDispatch();
  const [loadCompleted, setLoadCompleted] = useState(false);
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
  const upPullRefresh = useCallback(() => {
    getRewardedList(false, v => {
      if (isActive) {
        if (v === 1) {
          setLoadCompleted(false);
        } else {
          setLoadCompleted(true);
        }
        list.current && list.current.endUpPullRefresh();
        list.current && list.current.endBottomRefresh();
      }
    });
  }, [getRewardedList]);
  const onEndReached = useCallback(() => {
    getRewardedList(true, v => {
      if (v === 1) {
        setLoadCompleted(false);
      } else {
        setLoadCompleted(true);
      }
      list.current && list.current.endBottomRefresh();
    });
  }, [getRewardedList]);
  // const ItemComponent = useMemo(() => {
  //   return (
  //     <Touchable
  //       onPress={() => navigationService.navigate('Award')}
  //       style={styles.itemBox}>
  //       <View style={styles.leftBox}>
  //         <Image resizeMode="contain" style={styles.ballBox} source={ball} />
  //         <View style={styles.titleBox}>
  //           <TextM>时时彩</TextM>
  //           <TextM>xxxx</TextM>
  //         </View>
  //       </View>
  //       <View style={styles.intermediateBox}>
  //         <TextM>
  //           第<TextM style={styles.colorText}>xxxxxxxxxxxx</TextM>期
  //         </TextM>
  //       </View>
  //       <View style={styles.rightBox}>
  //         <TextM style={styles.colorText}>一等奖</TextM>
  //         <TextM>time</TextM>
  //       </View>
  //     </Touchable>
  //   );
  // }, []);
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
      <CommonHeader title="领奖列表" canBack />
      <Image
        resizeMode="contain"
        source={awardLogo}
        style={styles.awardLogoImage}
      />
      <TextM style={styles.tipStyle}>
        {rewardedList && rewardedList.length
          ? `请您务必在领奖期限内领取您的奖金${'\n'} 逾期奖金将自动返回资金池！`
          : '很遗憾你当前没有中奖，继续加油哦～'}
      </TextM>
      <ListComponent
        ref={list}
        whetherAutomatic
        data={rewardedList}
        bottomLoadTip="点击加载更多"
        message="空"
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
    marginLeft: pTd(10),
  },
  leftBox: {
    width: '30%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  intermediateBox: {
    width: '40%',
    alignItems: 'center',
  },
  rightBox: {
    alignItems: 'flex-end',
    width: '30%',
  },
  colorText: {
    color: Colors.fontColor,
  },
});
