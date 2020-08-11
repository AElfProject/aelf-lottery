import React, {memo} from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import ThreeDirectElection from './ThreeDirectElection';
import GroupThreePackage from './GroupThreePackage';
import GroupThreeValue from './GroupThreeValue';
import GroupSixPackage from './GroupSixPackage';
import GroupSixValue from './GroupSixValue';
import {View} from 'react-native';
import {GStyle, Colors} from '../../../../assets/theme';
import {CommonHeader} from '../../../../components/template';
const Tab = createMaterialTopTabNavigator();
import i18n from 'i18n-js';
import {pTd} from '../../../../utils/common';
import {pixelSize} from '../../../../utils/common/device';
const ThreeStars = props => {
  return (
    <View style={GStyle.container}>
      <CommonHeader
        title={i18n.t('lottery.threeStars')}
        canBack
        leftOnPress={() => props.navigation.goBack()}
      />
      <Tab.Navigator
        lazy={true}
        initialRouteName="ThreeDirectElection"
        tabBarOptions={{
          allowFontScaling: false,
          upperCaseLabel: false,
          activeTintColor: Colors.primaryColor,
          inactiveTintColor: Colors.fontGray,
          labelStyle: {
            fontSize: pTd(22),
            fontWeight: 'bold',
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
          name="ThreeDirectElection"
          component={ThreeDirectElection}
          options={{title: i18n.t('lottery.directElection')}}
        />
        <Tab.Screen
          name="GroupThreePackage"
          component={GroupThreePackage}
          options={{title: '组三包号'}}
        />
        <Tab.Screen
          name="GroupThreeValue"
          component={GroupThreeValue}
          options={{title: '组三合值'}}
        />
        <Tab.Screen
          name="GroupSixPackage"
          component={GroupSixPackage}
          options={{title: '组六包号'}}
        />
        <Tab.Screen
          name="GroupSixValue"
          component={GroupSixValue}
          options={{title: '组六合值'}}
        />
      </Tab.Navigator>
    </View>
  );
};

export default memo(ThreeStars);
