import {StyleSheet} from 'react-native';
import {Colors} from '../../../assets/theme';
import {pTd} from '../../../utils/common';
import {statusBarHeight} from '../../../utils/common/device';

export default StyleSheet.create({
  topBGStyles: {
    flexDirection: 'column-reverse',
    alignItems: 'center',
    height: statusBarHeight + pTd(300),
    backgroundColor: Colors.primaryColor,
    paddingBottom: pTd(30),
  },
  textTitle: {
    marginHorizontal: 20,
    color: 'white',
  },
  balanceBox: {
    alignItems: 'center',
    justifyContent: 'center',
    height: pTd(80),
    backgroundColor: '#FC6D30',
  },
  toolBox: {
    backgroundColor: 'white',
    paddingVertical: pTd(30),
    flexDirection: 'row',
    marginBottom: pTd(20),
  },
  toolItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolText: {
    marginTop: pTd(10),
  },
});
