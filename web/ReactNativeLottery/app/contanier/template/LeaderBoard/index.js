import React, {useCallback, useMemo, useRef} from 'react';
import {View} from 'react-native';
import {Colors, GStyle} from '../../../assets/theme';
import {CommonHeader, ListComponent} from '../../../components/template';
import i18n from 'i18n-js';
import Entypo from 'react-native-vector-icons/Entypo';
import navigationService from '../../../utils/common/navigationService';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import styles, {tabActiveColor} from './styles';
import {pixelSize} from '../../../utils/common/device';
import {pTd} from '../../../utils/common';
import {useDispatch} from 'react-redux';
import lotteryActions from '../../../redux/lotteryRedux';
import {useFocusEffectOnce, useStateToProps} from '../../../utils/pages/hooks';
import {TextM, TextS} from '../../../components/template/CommonText';
import aelfUtils from '../../../utils/pages/aelfUtils';
import unitConverter from '../../../utils/pages/unitConverter';
import config from '../../../config';
const {tokenSymbol} = config;
const Tab = createMaterialTopTabNavigator();
const OmitText = props => {
  return <TextM numberOfLines={1} ellipsizeMode="middle" {...props} />;
};
const CumulativeWinning = () => {
  const list = useRef();
  const dispatch = useDispatch();
  const {
    rewardAmountsList,
    selfWinningInfo,
    address,
    language,
  } = useStateToProps(state => {
    const {lottery, user, settings} = state;
    return {
      language: settings.language,
      address: user.address,
      rewardAmountsList: lottery.rewardAmountsList,
      selfWinningInfo: lottery.selfWinningInfo,
    };
  });
  const upPullRefresh = useCallback(() => {
    dispatch(
      lotteryActions.getRewardAmountsList(
        list.current && list.current.endUpPullRefresh(),
      ),
    );
  }, [dispatch]);
  useFocusEffectOnce(() => {
    upPullRefresh();
  });
  const onList = useMemo(() => {
    return (
      Array.isArray(rewardAmountsList) &&
      rewardAmountsList.findIndex(i => {
        return i.address === aelfUtils.formatRestoreAddress(address);
      })
    );
  }, [address, rewardAmountsList]);
  const ListHeaderComponent = useCallback(() => {
    return (
      <>
        <View style={styles.header}>
          <OmitText style={styles.headerText}>{address}</OmitText>
          <TextS style={styles.headerDetails}>
            {isNaN(onList) || onList === -1
              ? i18n.t('lottery.leaderBoard.notOnTheList')
              : i18n.t('lottery.leaderBoard.article', {count: onList + 1})}
            ｜{i18n.t('lottery.leaderBoard.cumulativeWinning')}
            {aelfUtils.digits(unitConverter.toLower(selfWinningInfo?.amount))}
            &nbsp;
            {tokenSymbol}
          </TextS>
        </View>
        <View style={styles.titleItem}>
          <TextS style={[styles.leftText, styles.grayText]}>#</TextS>
          <TextS style={[styles.centerText, styles.grayText]}>
            {i18n.t('address')}
          </TextS>
          <TextS style={[styles.rightText, styles.grayText]}>
            {i18n.t('lottery.leaderBoard.cumulativeWinning')}
          </TextS>
        </View>
      </>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, onList, selfWinningInfo?.amount, language]);
  const renderItem = useCallback(({item, index}) => {
    return (
      <View style={[styles.itemBox, {backgroundColor: Colors.bgColor}]}>
        <TextM style={styles.leftText}>{index + 1}</TextM>
        <OmitText style={styles.centerText}>
          {aelfUtils.formatAddress(item.address)}
        </OmitText>
        <TextM style={styles.rightText}>
          {aelfUtils.digits(unitConverter.toLower(item?.amount))} {tokenSymbol}
        </TextM>
      </View>
    );
  }, []);
  return (
    <ListComponent
      ref={list}
      data={rewardAmountsList}
      whetherAutomatic
      ListHeaderComponent={ListHeaderComponent}
      loadCompleted={true}
      renderItem={renderItem}
      upPullRefresh={upPullRefresh}
    />
  );
};
const CumulativePeriod = () => {
  const list = useRef();
  const dispatch = useDispatch();
  const {periodCountList, selfWinningInfo, address, language} = useStateToProps(
    state => {
      const {lottery, user, settings} = state;
      return {
        language: settings.language,
        address: user.address,
        periodCountList: lottery.periodCountList,
        selfWinningInfo: lottery.selfWinningInfo,
      };
    },
  );
  const upPullRefresh = useCallback(() => {
    dispatch(
      lotteryActions.getPeriodCountList(
        list.current && list.current.endUpPullRefresh(),
      ),
    );
  }, [dispatch]);
  useFocusEffectOnce(() => {
    upPullRefresh();
  });
  const onList = useMemo(() => {
    return (
      Array.isArray(periodCountList) &&
      periodCountList.findIndex(i => {
        return i.address === aelfUtils.formatRestoreAddress(address);
      })
    );
  }, [address, periodCountList]);
  const ListHeaderComponent = useCallback(() => {
    return (
      <>
        <View style={styles.header}>
          <OmitText style={styles.headerText}>{address}</OmitText>
          <TextM style={styles.headerDetails}>
            {isNaN(onList) || onList === -1
              ? i18n.t('lottery.leaderBoard.notOnTheList')
              : i18n.t('lottery.leaderBoard.article', {count: onList + 1})}
            &nbsp;|&nbsp;{i18n.t('lottery.leaderBoard.cumulativePeriod')}&nbsp;
            {selfWinningInfo?.periodCount || 0}
          </TextM>
        </View>
        <View style={styles.titleItem}>
          <TextM style={[styles.leftText, styles.grayText]}>#</TextM>
          <TextM style={[styles.centerText, styles.grayText]}>
            {i18n.t('address')}
          </TextM>
          <TextM style={[styles.rightText, styles.grayText]}>
            {i18n.t('lottery.leaderBoard.cumulativePeriod')}
          </TextM>
        </View>
      </>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, onList, selfWinningInfo?.periodCount, language]);
  const renderItem = useCallback(({item, index}) => {
    return (
      <View style={[styles.itemBox, {backgroundColor: Colors.bgColor}]}>
        <TextM style={styles.leftText}>{index + 1}</TextM>
        <OmitText style={styles.centerText}>
          {aelfUtils.formatAddress(item.address)}
        </OmitText>
        <TextM style={styles.rightText}>{item?.count}</TextM>
      </View>
    );
  }, []);
  return (
    <ListComponent
      ref={list}
      data={periodCountList}
      whetherAutomatic
      ListHeaderComponent={ListHeaderComponent}
      loadCompleted={true}
      renderItem={renderItem}
      upPullRefresh={upPullRefresh}
    />
  );
};

const LeaderBoard = () => {
  const dispatch = useDispatch();
  const getSelfWinningInfo = useCallback(
    () => dispatch(lotteryActions.getSelfWinningInfo()),
    [dispatch],
  );
  useFocusEffectOnce(() => {
    getSelfWinningInfo();
  });
  const {language} = useStateToProps(base => {
    const {settings} = base;
    return {
      language: settings.language,
    };
  });
  const tabNav = useMemo(
    () => [
      {
        name: 'CumulativeWinning',
        component: CumulativeWinning,
        options: {title: i18n.t('lottery.leaderBoard.Bonus')},
      },
      {
        name: 'CumulativePeriod',
        component: CumulativePeriod,
        options: {title: i18n.t('lottery.leaderBoard.Times')},
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [language],
  );
  return (
    <View style={GStyle.container}>
      <CommonHeader
        rightElement={
          <Entypo
            onPress={() => navigationService.navigate('LeaderBoardRule')}
            style={styles.rightBox}
            name="help-with-circle"
            color={Colors.primaryColor}
            size={pTd(40)}
          />
        }
        title={i18n.t('lottery.leaderBoard.leaderBoard')}
      />
      <Tab.Navigator
        lazy={false}
        tabBarOptions={{
          allowFontScaling: false,
          activeTintColor: tabActiveColor,
          inactiveTintColor: Colors.fontGray,
          indicatorStyle: {
            backgroundColor: tabActiveColor,
          },
          labelStyle: {
            fontSize: pTd(25),
          },
          style: {
            marginHorizontal: pTd(80),
            elevation: 0,
            borderBottomWidth: pixelSize,
            borderColor: Colors.borderColor,
          },
        }}>
        {tabNav.map((item, index) => {
          return <Tab.Screen key={index} {...item} />;
        })}
      </Tab.Navigator>
    </View>
  );
};

export default LeaderBoard;
