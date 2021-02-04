/* eslint-disable react-hooks/exhaustive-deps */
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
import i18n from 'i18n-js';
import {useFocusEffect} from '@react-navigation/native';
let isActive;
const Draw = () => {
  const [loadCompleted, setLoadCompleted] = useState(true);
  const dispatch = useDispatch();
  const list = useRef();
  const {drawPeriod, periodList, language, address} = useStateToProps(state => {
    const {lottery, settings, user} = state;
    return {
      language: settings.language,
      drawPeriod: lottery.drawPeriod,
      periodList: lottery.periodList,
      address: user.address,
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
  const getPeriodList = useCallback(
    (loadingPaging, callBack) =>
      dispatch(lotteryActions.getPeriodList(loadingPaging, callBack)),
    [dispatch],
  );
  const ListHeaderComponent = useMemo(() => {
    return (
      <View style={styles.listHeaderBox}>
        <TextM style={[styles.equallyBox, styles.leftBox]}>
          {i18n.t('lottery.draw.period')}
        </TextM>
        <TextM style={[styles.equallyBox, styles.intermediateBox]}>
          {i18n.t('lottery.draw.prizeNumber')}
        </TextM>
        <TextM style={[styles.equallyBox, styles.rightBox]}>
          {i18n.t('lottery.draw.drawTime')}
        </TextM>
      </View>
    );
  }, [language]);
  const LatestDraw = useMemo(() => {
    const {
      createTime,
      startPeriodNumberOfDay,
      periodNumber,
      drawTime,
      luckyNumber,
    } = drawPeriod || {};
    return (
      <View style={styles.titleBox}>
        <TextM style={styles.titleText}>
          {lotteryUtils.getPeriod(
            createTime,
            startPeriodNumberOfDay,
            periodNumber,
          )}
          {i18n.t('lottery.period')} {i18n.t('lottery.draw.drawTime')}&nbsp;
          {lotteryUtils.getStartMonthTime(drawTime)}
        </TextM>
        <WinningNumbers winningNumbers={luckyNumber} />
      </View>
    );
  }, [drawPeriod, language]);
  const onSetLoadCompleted = useCallback(value => {
    if (isActive) {
      setLoadCompleted(value);
    }
  }, []);
  const upPullRefresh = useCallback(() => {
    getPeriodList(false, v => {
      if (v === 1) {
        onSetLoadCompleted(false);
      } else {
        onSetLoadCompleted(true);
      }
      list.current && list.current.endUpPullRefresh();
      list.current && list.current.endBottomRefresh();
    });
  }, [getPeriodList]);
  const onEndReached = useCallback(() => {
    getPeriodList(true, v => {
      if (v === 1) {
        onSetLoadCompleted(false);
      } else {
        onSetLoadCompleted(true);
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
        title={i18n.t('lottery.draw.title')}
        rightTitle={address ? i18n.t('lottery.draw.acceptAward') : null}
        leftTitle={i18n.t('lottery.play')}
        titleBox={GStyle.flex1}
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
        bottomLoadTip={i18n.t('lottery.loadMore')}
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
    paddingLeft: pTd(60),
  },
  rightItem: {
    textAlign: 'right',
    paddingRight: pTd(20),
  },
});
