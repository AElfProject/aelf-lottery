import React, {memo, useMemo} from 'react';
import {View, StyleSheet} from 'react-native';
import {CommonHeader, Touchable} from '../../../../components/template';
import {GStyle, Colors} from '../../../../assets/theme';
import {TextL} from '../../../../components/template/CommonText';
import {pTd} from '../../../../utils/common';
import PlayComponent from '../PlayComponent';

const BigSmallSingleDouble = () => {
  return (
    <View style={GStyle.container}>
      <CommonHeader title="大小单双" canBack />
      <TextL style={styles.tipStyle}>
        十、个位至少各选一个号码，单注选号与开奖号码按位一致即中奖 1000金币！
      </TextL>
      <PlayComponent
        data={[
          {title: '十位', playList: ['大', '小', '单', '双']},
          {title: '十位', playList: ['大', '小', '单', '双']},
        ]}
      />
    </View>
  );
};
export default memo(BigSmallSingleDouble);

const styles = StyleSheet.create({
  tipStyle: {
    margin: pTd(20),
    color: Colors.fontColor,
  },
  selectBox: {
    flexDirection: 'row',
  },
});
