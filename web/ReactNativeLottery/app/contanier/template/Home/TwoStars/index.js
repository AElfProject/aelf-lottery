import React, {memo} from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import TwoDirectElection from './TwoDirectElection';
import TwoCombinedValue from './TwoCombinedValue';
import TwoGroup from './TwoGroup';
import {View} from 'react-native';
import {GStyle, Colors} from '../../../../assets/theme';
import {CommonHeader} from '../../../../components/template';
const Tab = createMaterialTopTabNavigator();
import i18n from 'i18n-js';
import {pTd} from '../../../../utils/common';
import {pixelSize} from '../../../../utils/common/device';
const TwoStars = props => {
  return (
    <View style={GStyle.container}>
      <CommonHeader
        title={i18n.t('lottery.twoStars')}
        canBack
        leftOnPress={() => props.navigation.goBack()}
      />
      <Tab.Navigator
        lazy={true}
        initialRouteName="FiveDirectElection"
        tabBarOptions={{
          allowFontScaling: false,
          upperCaseLabel: false,
          activeTintColor: Colors.primaryColor,
          inactiveTintColor: Colors.fontGray,
          labelStyle: {
            fontSize: pTd(32),
          },
          indicatorStyle: {
            backgroundColor: Colors.primaryColor,
            alignSelf: 'center',
          },
          tabStyle: {
            borderRightWidth: pixelSize,
            borderColor: Colors.fontGray,
          },
        }}>
        <Tab.Screen
          name="TwoDirectElection"
          component={TwoDirectElection}
          options={{title: i18n.t('lottery.directElection')}}
        />
        <Tab.Screen
          name="TwoCombinedValue"
          component={TwoCombinedValue}
          options={{title: '直选合值'}}
        />
        <Tab.Screen
          name="TwoGroup"
          component={TwoGroup}
          options={{title: '组选'}}
        />
      </Tab.Navigator>
    </View>
  );
};

export default memo(TwoStars);
