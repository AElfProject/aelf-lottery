import {StyleSheet} from 'react-native';
import {Colors} from '../../../../../../assets/theme';
import {pTd} from '../../../../../../utils/common';

export default StyleSheet.create({
  box: {
    padding: pTd(40),
    backgroundColor: Colors.bgColor,
  },
  input: {
    textAlignVertical: 'top',
    marginVertical: pTd(30),
    height: pTd(300),
    borderRadius: 5,
    borderWidth: 1,
  },
  explanationBox: {
    padding: pTd(40),
    paddingVertical: pTd(30),
  },
  explanationText: {
    marginTop: pTd(10),
    color: Colors.fontBlack,
  },
});
