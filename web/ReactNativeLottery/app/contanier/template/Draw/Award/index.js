import React, {memo, useMemo} from 'react';
import {View, ImageBackground, StyleSheet} from 'react-native';
import {CommonHeader, CommonButton} from '../../../../components/template';
import {GStyle, Colors} from '../../../../assets/theme';
import {drawBG} from '../../../../assets/images';
import {pTd} from '../../../../utils/common';
import {TextM, TextS} from '../../../../components/template/CommonText';
import {pixelSize} from '../../../../utils/common/device';
const TextComponent = memo(props => {
  const {title, details} = props;
  return (
    <View style={styles.TextBox}>
      <TextM style={styles.whiteColor}>{title}</TextM>
      <TextM style={[styles.colorText, styles.detailsText]}>{details}</TextM>
    </View>
  );
});
const Award = () => {
  const CardComponent = useMemo(() => {
    return (
      <ImageBackground
        resizeMode="stretch"
        source={drawBG}
        style={styles.drawBG}>
        <View style={styles.topBox}>
          <TextS style={styles.whiteColor}>购买期数</TextS>
          <TextS style={styles.whiteColor}>x注</TextS>
        </View>
        <View style={styles.intermediateBox}>
          <TextComponent title="购买金额" details="x金币" />
          <TextComponent title="中奖情况" details="一等奖" />
          <TextComponent title="奖金" details="100,000金币" />
        </View>
        <View style={styles.bottomBox}>
          <TextM style={styles.whiteColor}>第xxxxxxx期开奖号码</TextM>
          <TextM style={[styles.colorText, styles.numberText]}>88888</TextM>
        </View>
      </ImageBackground>
    );
  }, []);
  return (
    <View style={GStyle.container}>
      <CommonHeader title="领奖" canBack>
        <View style={styles.container}>
          {CardComponent}
          <View style={styles.box}>
            <TextM style={styles.myBetText}>我的投注</TextM>
            <View style={styles.bettingBox}>
              <TextM>五星通选</TextM>
            </View>
            <View style={styles.bettingBox}>
              <TextM>五星通选</TextM>
            </View>
            <View style={styles.bettingBox}>
              <TextM>五星通选</TextM>
            </View>
            <TextS style={styles.timeText}>下单时间：2019-06-04 10:10</TextS>
          </View>
          <CommonButton style={styles.buttonBox} title="领奖" />
          <TextS style={[styles.timeText, styles.awardTip]}>
            领奖后可在【我的】页面查看余额
          </TextS>
        </View>
      </CommonHeader>
    </View>
  );
};

export default memo(Award);

const styles = StyleSheet.create({
  drawBG: {
    padding: pTd(50),
  },
  container: {
    padding: pTd(40),
  },
  topBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: pTd(20),
    borderBottomColor: 'white',
    borderBottomWidth: pixelSize,
  },
  whiteColor: {
    color: 'white',
  },
  colorText: {
    color: '#F8CF10',
  },
  intermediateBox: {
    paddingVertical: pTd(20),
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: pixelSize,
    borderBottomColor: 'white',
  },
  TextBox: {
    alignItems: 'center',
  },
  detailsText: {
    marginTop: pTd(20),
  },
  bottomBox: {
    paddingTop: pTd(40),
    alignItems: 'center',
  },
  numberText: {
    letterSpacing: pTd(20),
    marginTop: pTd(20),
  },
  bettingBox: {
    paddingVertical: pTd(20),
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderColor,
  },
  timeText: {
    marginTop: pTd(30),
  },
  box: {
    marginTop: pTd(30),
  },
  myBetText: {
    fontWeight: 'bold',
    marginBottom: pTd(20),
  },
  buttonBox: {
    width: '70%',
    marginTop: pTd(200),
  },
  awardTip: {
    textAlign: 'center',
  },
});
