import React, {memo} from 'react';
import {StyleSheet, View} from 'react-native';
import WebView from 'react-native-webview';
import BounceSpinner from '../BounceSpinner';
const WebViewComponent = props => {
  return (
    <WebView
      {...props}
      startInLoadingState={true}
      renderLoading={() => (
        <View style={styles.loadingBox}>
          <BounceSpinner type="Wave" />
        </View>
      )}
    />
  );
};
export default memo(WebViewComponent);
const styles = StyleSheet.create({
  loadingBox: {
    position: 'absolute',
    alignSelf: 'center',
    marginTop: '50%',
  },
});
