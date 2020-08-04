import Constants from 'expo-constants';
import * as Device from 'expo-device';
import {BackHandler} from 'react-native';
import config from '../../config';
const {dingtalkAccessToken} = config;
const getDeviceInfo = () => {
  try {
    return `AppVersion: ${Constants.nativeAppVersion}\nBuildVersion: ${
      Constants.nativeBuildVersion
    }\nDevice isDevice: ${Device.isDevice}\nDevice Brand: ${
      Device.brand
    }\nDevice osName: ${Device.osName}\nDevice Manufacturer: ${
      Device.manufacturer
    }
Device Model: ${Device.modelName}\nDevice ID: ${
      Device.modelId
    }\nDevice deviceName: ${Device.deviceName}\nDevice osVersion: ${
      Device.osVersion
    }`;
  } catch (error) {
    return '';
  }
};
if (!__DEV__ && dingtalkAccessToken) {
  global.ErrorUtils.setGlobalHandler(async (error, isFatal) => {
    if (!isFatal || __DEV__ || !dingtalkAccessToken) {
      return;
    }
    try {
      const deviceInfo = getDeviceInfo();
      const {message, stack} = error || {};
      let Error =
        error && typeof error === 'string'
          ? `Error:${error}`
          : `${message ? `Error: ${message}\n` : ''}${
              stack ? `Stack: ${stack}\n` : ''
            }`;
      const body = JSON.stringify({
        msgtype: 'text',
        text: {
          content: `aelf Random Error:${Error}\n\n${deviceInfo}`,
        },
      });
      await fetch(
        `https://oapi.dingtalk.com/robot/send?access_token=${dingtalkAccessToken}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json;charset=utf-8',
          },
          body: body,
        },
      );
      BackHandler.exitApp();
    } catch (e) {
      console.log(e, '=setGlobalHandler');
    }
  });
}
