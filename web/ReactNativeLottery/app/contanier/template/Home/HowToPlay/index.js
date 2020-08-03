import React, {memo} from 'react';
import {View} from 'react-native';
import {GStyle} from '../../../../assets/theme';
import {CommonHeader} from '../../../../components/template';
import i18n from 'i18n-js';
const HowToPlay = () => {
  return (
    <View style={GStyle.container}>
      <CommonHeader title={i18n.t('lottery.howToPlay.title')} canBack />
    </View>
  );
};

export default memo(HowToPlay);
