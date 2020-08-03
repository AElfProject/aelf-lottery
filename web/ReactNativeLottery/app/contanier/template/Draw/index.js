import React, {memo, useMemo, useCallback, useRef, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {GStyle, Colors} from '../../../assets/theme';
import {
  CommonHeader,
  WinningNumbers,
  ListComponent,
} from '../../../components/template';
import {TextL, TextM, TextS} from '../../../components/template/CommonText';
import {pTd} from '../../../utils/common';
import navigationService from '../../../utils/common/navigationService';
import {useDispatch} from 'react-redux';
import lotteryActions from '../../../redux/lotteryRedux';
import lotteryUtils from '../../../utils/pages/lotteryUtils';
import aelfUtils from '../../../utils/pages/aelfUtils';
import {useStateToProps} from '../../../utils/pages/hooks';

const Draw = () => {
  const [loadCompleted, setLoadCompleted] = useState(false);
  const dispatch = useDispatch();
  const list = useRef();
  const {drawPeriod, periodList} = useStateToProps(state => {
    const {lottery} = state;
    return {
      drawPeriod: lottery.drawPeriod,
      periodList: lottery.periodList,
    };
  });
  const getPeriodList = useCallback(
    (loadingPaging, callBack) =>
      dispatch(lotteryActions.getPeriodList(loadingPaging, callBack)),
    [dispatch],
  );
  const ListHeaderComponent = useMemo(() => {
    return (
      <View style={styles.listHeaderBox}>
        <TextM style={[styles.equallyBox, styles.leftBox]}>期数</TextM>
        <TextM style={[styles.equallyBox, styles.intermediateBox]}>
          中奖号码
        </TextM>
        <TextL style={[styles.equallyBox, styles.rightBox]}>开奖时间</TextL>
      </View>
    );
  }, []);
  const LatestDraw = useMemo(() => {
    const {
      createTime,
      startPeriodNumberOfDay,
      periodNumber,
      drawTime,
      luckyNumber,
    } = drawPeriod || {};
    console.log(drawPeriod, '=====drawPeriod');
    return (
      <View style={styles.titleBox}>
        <TextM style={styles.titleText}>
          {lotteryUtils.getPeriod(
            createTime,
            startPeriodNumberOfDay,
            periodNumber,
          )}
          期 开奖时间 {lotteryUtils.getStartMonthTime(drawTime)}
        </TextM>
        <WinningNumbers winningNumbers={luckyNumber} />
      </View>
    );
  }, [drawPeriod]);
  const upPullRefresh = useCallback(() => {
    getPeriodList();
    list.current && list.current.endUpPullRefresh();
    list.current && list.current.endBottomRefresh();
  }, [getPeriodList]);
  const onEndReached = useCallback(() => {
    getPeriodList(true, v => {
      if (v === 1) {
        setLoadCompleted(false);
      } else {
        setLoadCompleted(true);
      }
      list.current && list.current.endBottomRefresh();
    });
  }, [getPeriodList]);
  const renderItem = useCallback(({item, index}) => {
    const {
      createTime,
      startPeriodNumberOfDay,
      periodNumber,
      luckyNumber,
      drawTime,
    } = item || {};
    return (
      <View style={[styles.lstItemBox, index % 2 && styles.listHeaderBox]}>
        <TextM style={[styles.equallyBox, styles.leftItem]}>
          {lotteryUtils.getPeriod(
            createTime,
            startPeriodNumberOfDay,
            periodNumber,
          )}
        </TextM>
        <TextM style={[styles.equallyBox, styles.winningNumbers]}>
          {lotteryUtils.getWinningNumbers(luckyNumber)}
        </TextM>
        <TextS style={[styles.equallyBox, styles.rightItem]}>
          {aelfUtils.timeConversion(drawTime, 'YYYY-MM-DD HH:mm')}
        </TextS>
      </View>
    );
  }, []);
  return (
    <View style={GStyle.container}>
      <CommonHeader
        title={'开奖公告'}
        rightTitle={'去领奖'}
        leftTitle={'玩法'}
        leftOnPress={() => navigationService.navigate('HowToPlay')}
        rightOnPress={() => navigationService.navigate('AwardList')}
      />
      {LatestDraw}
      {ListHeaderComponent}
      <ListComponent
        ref={list}
        data={periodList}
        whetherAutomatic
        showFooter={!loadCompleted}
        loadCompleted={loadCompleted}
        // allLoadedTips="加载完成"
        bottomLoadTip="点击加载更多"
        renderItem={renderItem}
        upPullRefresh={upPullRefresh}
        onEndReached={onEndReached}
      />
    </View>
  );
};
export default memo(Draw);
const styles = StyleSheet.create({
  titleText: {
    alignSelf: 'center',
  },
  titleBox: {
    marginVertical: pTd(30),
  },
  listHeaderBox: {
    paddingVertical: pTd(30),
    flexDirection: 'row',
    backgroundColor: '#E9E9E9',
  },
  lstItemBox: {
    paddingVertical: pTd(30),
    flexDirection: 'row',
    alignItems: 'center',
  },
  equallyBox: {
    width: `${100 / 3}%`,
  },
  leftBox: {
    paddingLeft: pTd(50),
  },
  intermediateBox: {
    textAlign: 'center',
  },
  rightBox: {
    textAlign: 'right',
    paddingRight: pTd(50),
  },
  winningNumbers: {
    textAlign: 'center',
    letterSpacing: pTd(20),
    color: Colors.fontColor,
  },
  leftItem: {
    paddingLeft: pTd(20),
  },
  rightItem: {
    textAlign: 'right',
    paddingRight: pTd(20),
  },
});
