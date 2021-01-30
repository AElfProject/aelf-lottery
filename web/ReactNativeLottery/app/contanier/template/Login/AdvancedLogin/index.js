import React, {useCallback, memo} from 'react';
import {
  CommonHeader,
  Touchable,
  Input,
  CommonButton,
  CommonToast,
} from '../../../../components/template';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {View, Keyboard} from 'react-native';
import {Colors, GStyle} from '../../../../assets/theme';
import NamePasswordTips from '../NamePasswordTips';
import styles, {tabActiveColor} from './styles';
import i18n from 'i18n-js';
import {useSetState, useStateToProps} from '../../../../utils/pages/hooks';
import {
  PASSWORD_REG,
  USERNAME_REG,
  PRIVATE_KEY_REG,
} from '../../../../config/constant';
import {TextM} from '../../../../components/template/CommonText';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import aelfUtils from '../../../../utils/pages/aelfUtils';
import userActions from '../../../../redux/userRedux';
import {useDispatch} from 'react-redux';
import {pTd} from '../../../../utils/common';
import {pixelSize} from '../../../../utils/common/device';
import navigationService from '../../../../utils/common/navigationService';
import {sleep} from '../../../../utils/pages';
const Tab = createMaterialTopTabNavigator();
const PrivateKeyLogin = () => {
  const [state, setState] = useSetState({
    topInput: '',
    userName: '',
    pwd: '',
    pwdConfirm: '',
    pwdDifferent: false,
    userNameRule: false,
    pwdRule: false,
    pwdConfirmRule: false,
  });
  const dispatch = useDispatch();
  const onRegistered = useCallback(
    (newWallet, pwd, userName, advanced) =>
      dispatch(userActions.onRegistered(newWallet, pwd, userName, advanced)),
    [dispatch],
  );
  const userNameBlur = useCallback(() => {
    const {userName} = state;
    if (!USERNAME_REG.test(userName)) {
      setState({userNameRule: true});
    } else {
      setState({userNameRule: false});
    }
  }, [setState, state]);
  const pwdBlur = useCallback(() => {
    const {pwd, pwdConfirm} = state;
    if (!PASSWORD_REG.test(pwd)) {
      setState({pwdRule: true});
    } else {
      setState({pwdRule: false});
    }

    if (pwdConfirm && pwd && pwdConfirm !== pwd) {
      setState({pwdDifferent: true});
    } else if (pwdConfirm && pwd && pwdConfirm === pwd) {
      setState({pwdDifferent: false});
    }
  }, [setState, state]);
  const pwdConfirmBlur = useCallback(() => {
    const {pwdConfirm, pwd} = state;
    if (!PASSWORD_REG.test(pwdConfirm)) {
      setState({pwdConfirmRule: true});
    } else {
      setState({pwdConfirmRule: false});
    }

    if (pwdConfirm && pwd && pwd !== pwdConfirm) {
      setState({pwdDifferent: true});
    } else if (pwdConfirm && pwd && pwd === pwdConfirm) {
      setState({pwdDifferent: false});
    }
  }, [setState, state]);
  const login = useCallback(() => {
    Keyboard.dismiss();
    const {topInput, userName, pwd, pwdConfirm} = state;
    if (!PRIVATE_KEY_REG.test(topInput)) {
      return CommonToast.fail(i18n.t('login.advancedLogin.PrivateKeyTip'));
    }
    try {
      const newWallet = aelfUtils.getWalletByPrivateKey(topInput.trim());
      if (
        newWallet &&
        USERNAME_REG.test(userName) &&
        pwdConfirm === pwd &&
        PASSWORD_REG.test(pwd)
      ) {
        onRegistered(newWallet, pwd, userName, true);
      } else {
        CommonToast.fail(i18n.t('fail'));
      }
    } catch (error) {
      CommonToast.fail(i18n.t('login.advancedLogin.PrivateKeyTip'));
    }
  }, [onRegistered, state]);
  const {
    userNameRule,
    pwdRule,
    pwdConfirmRule,
    pwdDifferent,
    userName,
    pwdConfirm,
    pwd,
  } = state;
  return (
    <Touchable
      style={GStyle.container}
      activeOpacity={1}
      onPress={() => Keyboard.dismiss()}>
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        keyboardOpeningTime={0}
        extraHeight={50}>
        <View style={styles.container}>
          <Input
            multiline={true}
            style={styles.input}
            onChangeText={topInput => setState({topInput})}
            placeholder={i18n.t('login.pleaseEnt')}
          />
          <Input
            maxLength={30}
            leftTitleBox={styles.leftTitleBox}
            leftTextStyle={styles.leftTextStyle}
            leftTitle={i18n.t('login.userName')}
            onBlur={userNameBlur}
            onChangeText={v => setState({userName: v})}
            placeholder={i18n.t('login.pleaseEnt')}
          />
          {userNameRule && (
            <TextM style={GStyle.pwTip}>{i18n.t('login.nameErr')}</TextM>
          )}
          <Input
            secureTextEntry={true}
            leftTitleBox={styles.leftTitleBox}
            leftTextStyle={styles.leftTextStyle}
            leftTitle={i18n.t('login.newPwd')}
            onBlur={pwdBlur}
            onChangeText={v => setState({pwd: v})}
            placeholder={i18n.t('login.pleaseEnt')}
          />
          {pwdRule && (
            <TextM style={GStyle.pwTip}>{i18n.t('login.pwdFormatErr')}</TextM>
          )}
          <Input
            secureTextEntry={true}
            leftTitleBox={[styles.leftTitleBox, {marginBottom: 10}]}
            leftTextStyle={styles.leftTextStyle}
            leftTitle={i18n.t('login.confirmPwd')}
            onBlur={pwdConfirmBlur}
            onChangeText={v => setState({pwdConfirm: v})}
            placeholder={i18n.t('login.pleaseEnt')}
          />
          {pwdConfirmRule && (
            <TextM style={GStyle.pwTip}>{i18n.t('login.pwdFormatErr')}</TextM>
          )}
          {pwdDifferent && (
            <TextM style={GStyle.pwTip}>{i18n.t('login.inconsistent')}</TextM>
          )}
          <NamePasswordTips />
          <CommonButton
            disabled={
              !USERNAME_REG.test(userName) ||
              !PASSWORD_REG.test(pwd) ||
              !(pwdConfirm === pwd)
            }
            onPress={login}
            title={i18n.t('login.login')}
            style={styles.buttonStyles}
          />
        </View>
      </KeyboardAwareScrollView>
    </Touchable>
  );
};
const MnemonicLogin = () => {
  const [state, setState] = useSetState({
    topInput: '',
    userName: '',
    pwd: '',
    pwdConfirm: '',
    pwdDifferent: false,
    userNameRule: false,
    pwdRule: false,
    pwdConfirmRule: false,
  });
  const dispatch = useDispatch();
  const onRegistered = useCallback(
    (newWallet, pwd, userName, advanced) =>
      dispatch(userActions.onRegistered(newWallet, pwd, userName, advanced)),
    [dispatch],
  );
  const userNameBlur = useCallback(() => {
    const {userName} = state;
    if (!USERNAME_REG.test(userName)) {
      setState({userNameRule: true});
    } else {
      setState({userNameRule: false});
    }
  }, [setState, state]);
  const pwdBlur = useCallback(() => {
    const {pwd, pwdConfirm} = state;
    if (!PASSWORD_REG.test(pwd)) {
      setState({pwdRule: true});
    } else {
      setState({pwdRule: false});
    }

    if (pwdConfirm && pwd && pwdConfirm !== pwd) {
      setState({pwdDifferent: true});
    } else if (pwdConfirm && pwd && pwdConfirm === pwd) {
      setState({pwdDifferent: false});
    }
  }, [setState, state]);
  const pwdConfirmBlur = useCallback(() => {
    const {pwdConfirm, pwd} = state;
    if (!PASSWORD_REG.test(pwdConfirm)) {
      setState({pwdConfirmRule: true});
    } else {
      setState({pwdConfirmRule: false});
    }

    if (pwdConfirm && pwd && pwd !== pwdConfirm) {
      setState({pwdDifferent: true});
    } else if (pwdConfirm && pwd && pwd === pwdConfirm) {
      setState({pwdDifferent: false});
    }
  }, [setState, state]);
  const login = useCallback(() => {
    Keyboard.dismiss();
    const {topInput, userName, pwd, pwdConfirm} = state;
    try {
      const newWallet = aelfUtils.getWalletByMnemonic(topInput.trim());
      if (
        newWallet &&
        USERNAME_REG.test(userName) &&
        pwdConfirm === pwd &&
        PASSWORD_REG.test(pwd)
      ) {
        onRegistered(newWallet, pwd, userName, true);
      } else {
        CommonToast.fail(i18n.t('login.advancedLogin.MnemonicTip'));
      }
    } catch (error) {
      console.log(error, '=======error');
      CommonToast.fail(i18n.t('login.advancedLogin.MnemonicTip'));
    }
  }, [onRegistered, state]);
  const {
    userNameRule,
    pwdRule,
    pwdConfirmRule,
    pwdDifferent,
    userName,
    pwdConfirm,
    pwd,
  } = state;
  return (
    <Touchable
      style={GStyle.container}
      activeOpacity={1}
      onPress={() => Keyboard.dismiss()}>
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        keyboardOpeningTime={0}
        extraHeight={50}>
        <View style={styles.container}>
          <Input
            multiline={true}
            style={styles.input}
            onChangeText={topInput => setState({topInput})}
            placeholder={i18n.t('login.pleaseEnt')}
          />
          <Input
            maxLength={30}
            leftTitleBox={styles.leftTitleBox}
            leftTextStyle={styles.leftTextStyle}
            leftTitle={i18n.t('login.userName')}
            onBlur={userNameBlur}
            onChangeText={v => setState({userName: v})}
            placeholder={i18n.t('login.pleaseEnt')}
          />
          {userNameRule && (
            <TextM style={GStyle.pwTip}>{i18n.t('login.nameErr')}</TextM>
          )}
          <Input
            secureTextEntry={true}
            leftTitleBox={styles.leftTitleBox}
            leftTextStyle={styles.leftTextStyle}
            leftTitle={i18n.t('login.newPwd')}
            onBlur={pwdBlur}
            onChangeText={v => setState({pwd: v})}
            placeholder={i18n.t('login.pleaseEnt')}
          />
          {pwdRule && (
            <TextM style={GStyle.pwTip}>{i18n.t('login.pwdFormatErr')}</TextM>
          )}
          <Input
            secureTextEntry={true}
            leftTitleBox={[styles.leftTitleBox, {marginBottom: 10}]}
            leftTextStyle={styles.leftTextStyle}
            leftTitle={i18n.t('login.confirmPwd')}
            onBlur={pwdConfirmBlur}
            onChangeText={v => setState({pwdConfirm: v})}
            placeholder={i18n.t('login.pleaseEnt')}
          />
          {pwdConfirmRule && (
            <TextM style={GStyle.pwTip}>{i18n.t('login.pwdFormatErr')}</TextM>
          )}
          {pwdDifferent && (
            <TextM style={GStyle.pwTip}>{i18n.t('login.inconsistent')}</TextM>
          )}
          <NamePasswordTips />
          <CommonButton
            disabled={
              !USERNAME_REG.test(userName) ||
              !PASSWORD_REG.test(pwd) ||
              !(pwdConfirm === pwd)
            }
            onPress={login}
            title={i18n.t('login.login')}
            style={styles.buttonStyles}
          />
        </View>
      </KeyboardAwareScrollView>
    </Touchable>
  );
};
const KeyStoreLogin = () => {
  const [state, setState] = useSetState({
    topInput: '',
    pwd: '',
    pwdRule: false,
    loading: false,
  });
  const {payPw} = useStateToProps(base => {
    const {settings} = base;
    return {
      payPw: settings.payPw,
    };
  });
  const dispatch = useDispatch();
  const onLoginSuccess = useCallback(
    data => dispatch(userActions.onLoginSuccess(data)),
    [dispatch],
  );
  const pwdBlur = useCallback(() => {
    const {pwd, pwdConfirm} = state;
    if (!PASSWORD_REG.test(pwd)) {
      setState({pwdRule: true});
    } else {
      setState({pwdRule: false});
    }

    if (pwdConfirm && pwd && pwdConfirm !== pwd) {
      setState({pwdDifferent: true});
    } else if (pwdConfirm && pwd && pwdConfirm === pwd) {
      setState({pwdDifferent: false});
    }
  }, [setState, state]);
  const login = useCallback(async () => {
    const {topInput, pwd} = state;
    setState({loading: true});
    await sleep(500);
    try {
      const keystore = JSON.parse(topInput);
      const {address, privateKey, nickName} = aelfUtils.unlockKeystore(
        keystore,
        pwd,
      );
      onLoginSuccess({
        address: address,
        keystore,
        userName: nickName || aelfUtils.formatAddress(address),
        balance: 0,
        saveQRCode: false,
        privateKey,
      });
      CommonToast.success(i18n.t('loginSuccess'));
      if (payPw && payPw.length === 6) {
        navigationService.reset('Tab');
      } else {
        navigationService.reset([{name: 'Tab'}, {name: 'SetTransactionPwd'}]);
      }
      setState({loading: false});
    } catch (error) {
      console.log(error, '======error');
      CommonToast.fail(i18n.t('login.advancedLogin.KeyStore'));
      setState({loading: false});
    }
    // navigationService.reset('Tab');
  }, [onLoginSuccess, payPw, setState, state]);
  const {pwdRule, loading, topInput, pwd} = state;
  return (
    <Touchable
      style={GStyle.container}
      activeOpacity={1}
      onPress={() => Keyboard.dismiss()}>
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        keyboardOpeningTime={0}
        extraHeight={50}>
        <View style={styles.container}>
          <Input
            multiline={true}
            style={styles.input}
            onChangeText={v => setState({topInput: v})}
            placeholder={i18n.t('login.pleaseEnt')}
          />
          <Input
            secureTextEntry={true}
            leftTitleBox={styles.leftTitleBox}
            leftTextStyle={styles.leftTextStyle}
            leftTitle={i18n.t('login.pwd')}
            onBlur={pwdBlur}
            onChangeText={v => setState({pwd: v})}
            placeholder={i18n.t('login.pleaseEnt')}
          />
          {pwdRule && (
            <TextM style={GStyle.pwTip}>{i18n.t('login.pwdFormatErr')}</TextM>
          )}
          <NamePasswordTips />
          <CommonButton
            disabled={!pwd || !topInput}
            loading={loading}
            onPress={login}
            title={i18n.t('login.login')}
            style={styles.buttonStyles}
          />
        </View>
      </KeyboardAwareScrollView>
    </Touchable>
  );
};
const AdvancedLogin = ({navigation}) => {
  const tabNav = [
    {
      name: 'PrivateKeyLogin',
      component: PrivateKeyLogin,
      options: {title: i18n.t('login.advancedLogin.PrivateKey')},
    },
    {
      name: 'KeyStoreLogin',
      component: KeyStoreLogin,
      options: {title: 'KeyStore'},
    },
    {
      name: 'MnemonicLogin',
      component: MnemonicLogin,
      options: {title: i18n.t('login.advancedLogin.Mnemonic')},
    },
  ];
  return (
    <View style={GStyle.container}>
      <CommonHeader
        title={i18n.t('login.advancedLogin.title')}
        canBack
        canBackOnPress={() => navigation.goBack()}
      />
      <Tab.Navigator
        lazy={false}
        tabBarOptions={{
          upperCaseLabel: false,
          allowFontScaling: false,
          activeTintColor: tabActiveColor,
          inactiveTintColor: Colors.fontGray,
          indicatorStyle: {
            backgroundColor: tabActiveColor,
          },
          labelStyle: {
            fontSize: pTd(25),
          },
          style: {
            marginHorizontal: pTd(20),
            elevation: 0,
            borderBottomWidth: pixelSize,
            borderColor: Colors.borderColor,
          },
        }}>
        {tabNav.map((item, index) => {
          return <Tab.Screen key={index} {...item} />;
        })}
      </Tab.Navigator>
    </View>
  );
};
export default memo(AdvancedLogin);
