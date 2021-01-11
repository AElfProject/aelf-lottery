import React, {memo} from 'react';
import {StyleSheet, View} from 'react-native';
import {TextM} from '../CommonText';
import {pTd} from '../../../utils/common';
import {Colors} from '../../../assets/theme';
import lotteryUtils from '../../../utils/pages/lotteryUtils';

const WinningNumbers = props => {
  const {winningNumbers} = props;
  const number = lotteryUtils.getWinningNumbersStr(winningNumbers);
  if (number.length) {
    return (
      <View style={styles.prizeNumberBox}>
        {number.map((item, index) => {
          return (
            <View style={styles.prizeNumberItem} key={index}>
              <TextM style={styles.prizeNumberText}>{item}</TextM>
            </View>
          );
        })}
      </View>
    );
  }
  return null;
};
export default memo(WinningNumbers);
const styles = StyleSheet.create({
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
});
