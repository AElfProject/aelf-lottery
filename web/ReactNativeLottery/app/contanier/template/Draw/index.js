import React, {memo, useMemo} from 'react';
import {View, StyleSheet} from 'react-native';
import {GStyle} from '../../../assets/theme';
import {
  CommonHeader,
  WinningNumbers,
  ListComponent,
} from '../../../components/template';
import {TextL, TextM} from '../../../components/template/CommonText';
import {pTd} from '../../../utils/common';
import navigationService from '../../../utils/common/navigationService';

const Draw = () => {
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
  return (
    <View style={GStyle.container}>
      <CommonHeader
        title={'开奖公告'}
        rightTitle={'去领奖'}
        leftTitle={'玩法'}
        rightOnPress={() => navigationService.navigate('AwardList')}
      />
      <View style={styles.titleBox}>
        <TextL style={styles.titleText}>xxxxx xxxxx xxxx</TextL>
        <WinningNumbers winningNumbers="88888" />
      </View>
      <ListComponent data={[{}]} ListHeaderComponent={ListHeaderComponent} />
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
    paddingVertical: pTd(20),
    flexDirection: 'row',
    backgroundColor: '#E9E9E9',
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
});
