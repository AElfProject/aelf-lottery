import React, {memo, useMemo} from 'react';
import {View, Image, StyleSheet} from 'react-native';
import {CommonHeader, Touchable} from '../../../../components/template';
import {GStyle, Colors} from '../../../../assets/theme';
import {awardLogo, ball} from '../../../../assets/images';
import {pTd} from '../../../../utils/common';
import {TextM} from '../../../../components/template/CommonText';
import navigationService from '../../../../utils/common/navigationService';
const AwardList = () => {
  const ItemComponent = useMemo(() => {
    return (
      <Touchable
        onPress={() => navigationService.navigate('Award')}
        style={styles.itemBox}>
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
          <TextM style={styles.colorText}>一等奖</TextM>
          <TextM>time</TextM>
        </View>
      </Touchable>
    );
  }, []);
  return (
    <View style={GStyle.container}>
      <CommonHeader title="领奖列表" canBack />
      <Image
        resizeMode="contain"
        source={awardLogo}
        style={styles.awardLogoImage}
      />
      <TextM style={styles.tipStyle}>
        请您务必在领奖期限内领取您的奖金{'\n'} 逾期奖金将自动返回资金池！
      </TextM>
      {ItemComponent}
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
