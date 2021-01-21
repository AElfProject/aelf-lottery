import React, {memo, useMemo} from 'react';
import {View} from 'react-native';
import {GStyle} from '../../../../assets/theme';
import {CommonHeader, WebViewComponent} from '../../../../components/template';
import i18n from 'i18n-js';
import aelfUtils from '../../../../utils/pages/aelfUtils';
import {useStateToProps} from '../../../../utils/pages/hooks';
const TransactionManagement = () => {
  const {address} = useStateToProps(base => {
    const {user} = base;
    return {
      address: user.address,
    };
  });
  const Components = useMemo(() => {
    const uri = aelfUtils.webURLAddress(address);
    return (
      <View style={GStyle.secondContainer}>
        <CommonHeader
          title={i18n.t('mineModule.transactionManagementT')}
          canBack
        />
        <WebViewComponent source={{uri}} startInLoadingState={true} />
      </View>
    );
  }, [address]);
  return Components;
};

export default memo(TransactionManagement);
