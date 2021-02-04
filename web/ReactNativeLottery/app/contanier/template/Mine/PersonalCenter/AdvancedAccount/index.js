import React, {memo, useCallback} from 'react';
import {View} from 'react-native';
import {
  CommonHeader,
  ListItem,
  VerifyPassword,
} from '../../../../../components/template';
import styles from './styles';
import i18n from 'i18n-js';
import {GStyle} from '../../../../../assets/theme';
import {useStateToProps} from '../../../../../utils/pages/hooks';
import navigationService from '../../../../../utils/common/navigationService';
const AdvancedAccount = () => {
  const {keystore} = useStateToProps(base => {
    const {user} = base;
    return {
      keystore: user.keystore,
    };
  });
  const onPassword = useCallback(
    key => {
      VerifyPassword.passwordShow(keystore, (value, pwd) => {
        value && navigationService.navigate('ExportAccount', {type: key, pwd});
      });
    },
    [keystore],
  );
  return (
    <View style={GStyle.secondContainer}>
      <CommonHeader
        title={i18n.t('mineModule.personalCenter.advancedAccount')}
        canBack
      />
      <View style={styles.box}>
        <ListItem
          title={i18n.t('mineModule.AdvancedAccount.Export', {
            type: i18n.t('mineModule.AdvancedAccount.PrivateKey'),
          })}
          onPress={() => onPassword('0')}
        />
        <ListItem
          title={i18n.t('mineModule.AdvancedAccount.Export', {
            type: 'Keystore',
          })}
          onPress={() => onPassword('1')}
        />
        <ListItem
          title={i18n.t('mineModule.AdvancedAccount.Export', {
            type: i18n.t('mineModule.AdvancedAccount.Mnemonic'),
          })}
          onPress={() => onPassword('2')}
        />
      </View>
    </View>
  );
};

export default memo(AdvancedAccount);
