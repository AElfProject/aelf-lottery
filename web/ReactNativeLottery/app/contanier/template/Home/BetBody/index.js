import React, {memo} from 'react';
import {StyleSheet, View} from 'react-native';
import PlayComponent from '../PlayComponent';
import ShowBetComponent from '../ShowBetComponent';

const BetBody = props => {
  return (
    <View style={styles.box}>
      <PlayComponent {...props} />
      <ShowBetComponent {...props} />
    </View>
  );
};
export default memo(BetBody);

const styles = StyleSheet.create({
  box: {
    flex: 1,
    justifyContent: 'space-between',
  },
});
