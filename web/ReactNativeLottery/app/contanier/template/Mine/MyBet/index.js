import React, {memo} from 'react';
import {View, StyleSheet, Image} from 'react-native';
import {CommonHeader} from '../../../../components/template';
import {GStyle, Colors} from '../../../../assets/theme';
import {ball} from '../../../../assets/images';
import {pTd} from '../../../../utils/common';
import {TextS, TextM} from '../../../../components/template/CommonText';

const MyBet = () => {
  return (
    <View style={GStyle.container}>
      <CommonHeader title="我的投注" canBack />
      <View style={styles.itemBox}>
        <View style={styles.leftBox}>
          <Image resizeMode="contain" style={styles.ballBox} source={ball} />
          <View style={styles.titleBox}>
            <TextM>时时彩</TextM>
            <TextM>xxxx</TextM>
          </View>
        </View>
        <View style={styles.intermediateBox}>
          <TextM>
            第<TextM style={styles.colorText}>xxxxxxxxxxxx</TextM>期
          </TextM>
        </View>
        <View style={styles.rightBox}>
          <TextM>未中奖</TextM>
          <TextM>time</TextM>
        </View>
      </View>
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
