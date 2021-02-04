import React from 'react';
import {View} from 'react-native';
import {GStyle} from '../../../../assets/theme';
import {CommonHeader, WebViewComponent} from '../../../../components/template';
import i18n from 'i18n-js';
import {useStateToProps} from '../../../../utils/pages/hooks';

const ruleURI = 'https://lot-rules-mainnet-tryout.aelf.io/ranking-rules/';

const LeaderBoardRule = () => {
  const {language} = useStateToProps(base => {
    const {settings} = base;
    return {
      language: settings.language,
    };
  });
  console.log(ruleURI + language);
  return (
    <View style={GStyle.container}>
      <CommonHeader
        canBack
        title={i18n.t('lottery.leaderBoard.leaderBoardRule')}
      />
      <WebViewComponent
        startInLoadingState={true}
        source={{uri: ruleURI + language || 'en'}}
      />
    </View>
  );
};
export default LeaderBoardRule;
