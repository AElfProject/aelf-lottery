import React, {useMemo} from 'react';
import {View} from 'react-native';
import {
  CommonButton,
  CommonHeader,
  Input,
} from '../../../../../../components/template';
import styles from './styles';
import i18n from 'i18n-js';
import {GStyle} from '../../../../../../assets/theme';
import {useStateToProps} from '../../../../../../utils/pages/hooks';
import {TextL, TextM} from '../../../../../../components/template/CommonText';
import {onCopyText} from '../../../../../../utils/pages';
import aelfUtils from '../../../../../../utils/pages/aelfUtils';
const ExportAccount = ({route}) => {
  const {privateKey, keystore} = useStateToProps(base => {
    const {user} = base;
    return {
      privateKey: user.privateKey,
      keystore: user.keystore,
    };
  });
  const {params} = route || {};
  const info = useMemo(() => {
    const {type, pwd} = params || {};
    let tip = '',
      value = '',
      disabled = false,
      explanation1 = '';
    switch (type) {
      case '0':
        //PrivateKey
        tip = i18n.t('mineModule.AdvancedAccount.PrivateKey');
        value = privateKey;
        explanation1 = i18n.t(
          'mineModule.AdvancedAccount.PrivateKeyExplanation',
        );
        break;
      case '1':
        //Keystore
        tip = 'Keystore';
        value = JSON.stringify(keystore);
        explanation1 = i18n.t('mineModule.AdvancedAccount.KeystoreExplanation');
        break;
      case '2':
        //Mnemonic
        let text = '';
        tip = i18n.t('mineModule.AdvancedAccount.Mnemonic');
        try {
          const {mnemonic} = aelfUtils.unlockKeystore(keystore, pwd);
          text = mnemonic;
        } catch (error) {
          console.log(error, '====unlockKeystore');
        }
        disabled = !text;
        value = text || i18n.t('mineModule.AdvancedAccount.MnemonicEmptyTip');
        explanation1 = i18n.t('mineModule.AdvancedAccount.MnemonicExplanation');
        break;
    }
    return {
      disabled,
      title: i18n.t('mineModule.AdvancedAccount.Export', {type: tip}),
      tip,
      buttonTitle: i18n.t('mineModule.AdvancedAccount.Copy', {type: tip}),
      value,
      explanationTitle1: i18n.t('mineModule.AdvancedAccount.Description', {
        type: tip,
      }),
      explanation1,
    };
  }, [keystore, params, privateKey]);
  return (
    <View style={GStyle.secondContainer}>
      <CommonHeader title={info.title} canBack>
        <View style={styles.box}>
          <TextL>{info.tip}</TextL>
          <Input
            editable={false}
            value={info.value}
            multiline={true}
            style={styles.input}
          />
          <CommonButton
            disabled={info.disabled}
            title={info.buttonTitle}
            onPress={() => onCopyText(info.value)}
          />
        </View>
        <View style={styles.explanationBox}>
          <TextM>{info.explanationTitle1}</TextM>
          <TextM style={styles.explanationText}>{info.explanation1}</TextM>
        </View>
        <View style={styles.explanationBox}>
          <TextM>{i18n.t('mineModule.AdvancedAccount.OfflineStorage')}</TextM>
          <TextM style={styles.explanationText}>
            {i18n.t('mineModule.AdvancedAccount.OfflineExplanation', {
              type: info.tip,
            })}
          </TextM>
        </View>
      </CommonHeader>
    </View>
  );
};

export default ExportAccount;
