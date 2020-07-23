import React, {memo, useMemo} from 'react';
import {
  CommonHeader,
  WordRotation,
  CountDown,
  Touchable,
} from '../../../components/template';
import {ScrollView, View, Image} from 'react-native';
import {useSelector, shallowEqual} from 'react-redux';
import {settingsSelectors} from '../../../redux/settingsRedux';
import {GStyle} from '../../../assets/theme';
import styles from './styles';
import {TextL, TextM} from '../../../components/template/CommonText';
import {splitString} from '../../../utils/pages';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Octicons from 'react-native-vector-icons/Octicons';
import navigationService from '../../../utils/common/navigationService';
import {ball} from '../../../assets/images';
const list = [
  {title: '五星', onPress: () => navigationService.navigate('FiveStars')},
  {title: '三星', onPress: () => navigationService.navigate('ThreeStars')},
  {title: '二星', onPress: () => navigationService.navigate('TwoStars')},
  {title: '一星', onPress: () => navigationService.navigate('OneStar')},
  {
    title: '大小单双',
    onPress: () => navigationService.navigate('BigSmallSingleDouble'),
  },
];
const Home = () => {
  useSelector(settingsSelectors.getLanguage, shallowEqual); //Language status is controlled with redux
  const LatestDraw = useMemo(() => {
    const number = splitString('88888');
    return (
      <View style={styles.box}>
        <TextM style={styles.textStyle}>最新开奖</TextM>
        {number.length && (
          <View style={styles.prizeNumberBox}>
            {number.map((item, index) => {
              return (
                <View style={styles.prizeNumberItem} key={index}>
                  <TextM style={styles.prizeNumberText}>{item}</TextM>
                </View>
              );
            })}
          </View>
        )}
      </View>
    );
  }, []);

  const CurrentDraw = useMemo(() => {
    return (
      <View style={styles.box}>
        <TextM style={styles.textStyle}>当前</TextM>
        <View style={styles.currentBox}>
          <View style={styles.currentItem}>
            <MaterialIcons name="access-time" size={30} />
            <TextM style={styles.endTip}>距离购买截止</TextM>
            <CountDown
              style={styles.countDownBox}
              date={new Date().getTime() + 600000}
              mins="分"
              segs="秒"
            />
          </View>
          <View style={styles.borderView} />
          <View style={styles.currentItem}>
            <Octicons name="database" size={30} />
            <TextM style={styles.endTip}>奖池</TextM>
          </View>
        </View>
      </View>
    );
  }, []);
  const PurchaseEntry = useMemo(() => {
    return (
      <View style={styles.bottomBox}>
        {list.map((item, index) => {
          return (
            <Touchable
              onPress={item.onPress}
              style={styles.bottomItem}
              key={index}>
              <Image
                resizeMode="contain"
                style={styles.ballBox}
                source={ball}
              />
              <TextL style={styles.bottomText}>{item.title}</TextL>
            </Touchable>
          );
        })}
      </View>
    );
  }, []);
  return (
    <View style={GStyle.container}>
      <CommonHeader
        title={'欢乐时时彩'}
        rightTitle={'登录'}
        leftTitle={'玩法'}
      />
      <WordRotation
        textStyle={styles.rotationText}
        bgViewStyle={styles.rotationBox}>
        快报 恭喜xxzxxxxxxxxxxxxxxx
      </WordRotation>
      <ScrollView>
        <View style={GStyle.container}>
          {LatestDraw}
          {CurrentDraw}
          {PurchaseEntry}
        </View>
      </ScrollView>
    </View>
  );
};
export default memo(Home);
