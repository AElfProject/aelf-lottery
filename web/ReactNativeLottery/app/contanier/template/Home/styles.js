import {StyleSheet} from 'react-native';
import {Colors} from '../../../assets/theme';
import {pTd} from '../../../utils/common';

const styles = StyleSheet.create({
  box: {
    paddingVertical: pTd(50),
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderColor,
  },
  rotationBox: {
    backgroundColor: Colors.primaryColor,
  },
  rotationText: {
    marginVertical: pTd(10),
    fontSize: pTd(28),
    color: 'white',
  },
  textStyle: {
    alignSelf: 'center',
  },
  prizeNumberBox: {
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  prizeNumberItem: {
    marginTop: pTd(20),
    marginHorizontal: pTd(10),
    backgroundColor: Colors.primaryColor,
    height: pTd(50),
    width: pTd(50),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: pTd(25),
  },
  prizeNumberText: {
    color: 'white',
  },
  countDownBox: {
    marginTop: pTd(10),
  },
  currentBox: {
    marginTop: pTd(10),
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  currentItem: {
    flex: 1,
    alignItems: 'center',
  },
  borderView: {
    marginVertical: pTd(30),
    width: 1,
    backgroundColor: Colors.borderColor,
  },
  endTip: {
    color: Colors.fontGray,
    marginTop: pTd(10),
  },
  bottomBox: {
    flexWrap: 'wrap',
    flexDirection: 'row',
  },
  bottomItem: {
    paddingVertical: pTd(30),
    width: '30%',
    marginHorizontal: `${10 / 6}%`,
    alignItems: 'center',
    borderColor: Colors.borderColor,
    borderWidth: 1,
    marginTop: pTd(30),
  },
  bottomText: {
    marginTop: pTd(30),
  },
});

export default styles;
