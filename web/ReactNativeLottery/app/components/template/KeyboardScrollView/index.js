import React, {memo} from 'react';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {View} from 'react-native';
import {bottomBarHeigth} from '../../../utils/common/device';
const KeyboardScrollView = props => {
  const {children} = props;
  return (
    <KeyboardAwareScrollView
      keyboardShouldPersistTaps="handled"
      keyboardOpeningTime={0}
      extraHeight={50}>
      {children}
      <View style={{height: bottomBarHeigth}} />
    </KeyboardAwareScrollView>
  );
};

export default memo(KeyboardScrollView);
