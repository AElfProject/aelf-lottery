import React, {memo} from 'react';
import {View} from 'react-native';
import {GStyle} from '../../../../assets/theme';
import {CommonHeader} from '../../../../components/template';

const HowToPlay = () => {
  return (
    <View style={GStyle.container}>
      <CommonHeader title="玩法" canBack />
    </View>
  );
};

export default memo(HowToPlay);
