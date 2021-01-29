import {StyleSheet} from 'react-native';
import {pTd} from '../../../utils/common';
import {Colors} from '../../../assets/theme';
import {pixelSize} from '../../../utils/common/device';
export const tabActiveColor = Colors.primaryColor;
export default StyleSheet.create({
  header: {
    paddingHorizontal: pTd(40),
    paddingVertical: pTd(20),
    backgroundColor: 'white',
  },
  headerDetails: {
    color: Colors.fontGray,
    marginTop: pTd(10),
  },
  headerText: {
    width: '60%',
  },
  titleItem: {
    padding: pTd(20),
    paddingHorizontal: pTd(30),
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemBox: {
    padding: pTd(30),
    paddingVertical: pTd(30),
    flexDirection: 'row',
    borderBottomWidth: pixelSize,
    borderBottomColor: Colors.borderColor,
  },
  leftText: {
    width: '20%',
  },
  centerText: {
    width: '40%',
  },
  rightText: {
    textAlign: 'right',
    width: '40%',
  },
  grayText: {
    color: Colors.fontGray,
  },
  rightBox: {
    paddingHorizontal: pTd(30),
  },
});
