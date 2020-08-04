import React, {memo} from 'react';
import {View, StyleSheet} from 'react-native';
import {GStyle} from '../../../../assets/theme';
import {CommonHeader} from '../../../../components/template';
import i18n from 'i18n-js';
import {TextL} from '../../../../components/template/CommonText';
import {bottomBarHeigth} from '../../../../utils/common/device';
import {pTd} from '../../../../utils/common';
import {useStateToProps} from '../../../../utils/pages/hooks';
import howToPlay from './config';
const HowToPlay = () => {
  const {language} = useStateToProps(base => {
    const {settings} = base;
    return {
      language: settings.language,
    };
  });
  const howPlay = howToPlay[language || 'en'];
  return (
    <View style={GStyle.container}>
      <CommonHeader title={i18n.t('lottery.howToPlay.title')} canBack>
        <View style={styles.container}>
          <TextL>{howPlay?.details}</TextL>
        </View>
      </CommonHeader>
    </View>
  );
};

export default memo(HowToPlay);
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: pTd(15),
    paddingBottom: pTd(30) + bottomBarHeigth,
  },
});
