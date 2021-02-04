import React, {memo, useEffect, useCallback, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Colors} from '../../../assets/theme';
import {pTd} from '../../../utils/common';
import CommonToast from '../CommonToast';
import Input from '../Input';
import Touchable from '../Touchable';

const reg = /^[0-9]+$/;
const Stepper = props => {
  const {
    style,
    max,
    inputLeftElement,
    min,
    onChange,
    defaultValue,
    value,
    fontColor,
  } = props;
  const va = defaultValue || value;
  const [num, setNum] = useState(va ? String(va) : null);
  useEffect(() => {
    if (value > 0) {
      setNum(String(value));
    }
  }, [value]);
  const onSetValue = useCallback(
    v => {
      onChange?.(typeof v === 'string' ? Number(v) : v);
      setNum(typeof v === 'number' ? v.toString() : v);
    },
    [onChange],
  );
  const onChangeText = useCallback(
    v => {
      if (reg.test(v) || !v) {
        if (v > max) {
          CommonToast.text(`max ${max}`);
          onSetValue(max);
        } else {
          onSetValue(v);
        }
      }
      console.log(v);
    },
    [max, onSetValue],
  );
  const addDisabled = num >= max;
  const subDisabled = num <= min;

  return (
    <View style={[styles.box, style]}>
      <Touchable
        onPress={() => onSetValue(Number(num) - 1)}
        disabled={subDisabled}
        style={styles.subBox}>
        <Text
          style={[
            styles.fontStyles,
            fontColor && {color: fontColor},
            subDisabled && styles.grayText,
          ]}>
          -
        </Text>
      </Touchable>
      <View style={styles.inputBox}>
        {inputLeftElement ? inputLeftElement : null}
        <Input
          maxLength={typeof max === 'number' ? max.toString().length : max}
          value={num}
          onChangeText={onChangeText}
          style={[styles.input, fontColor && {color: fontColor}]}
          keyboardType={'numeric'}
        />
      </View>
      <Touchable
        disabled={addDisabled}
        onPress={() => {
          onSetValue(num ? Number(num) + 1 : 1);
        }}
        style={styles.addBox}>
        <Text
          style={[
            styles.fontStyles,
            fontColor && {color: fontColor},
            addDisabled && styles.grayText,
          ]}>
          +
        </Text>
      </Touchable>
    </View>
  );
};

export default memo(Stepper);
const styles = StyleSheet.create({
  fontStyles: {
    color: Colors.fontBlack,
    fontSize: pTd(28),
  },
  grayText: {
    color: Colors.fontGray,
  },
  box: {
    minWidth: 10,
    flex: 1,
    flexDirection: 'row',
  },
  input: {
    minWidth: 50,
    height: 30,
    borderWidth: 0,
    borderBottomWidth: 0,
    paddingHorizontal: 0,
    color: Colors.fontBlack,
  },
  inputBox: {
    paddingLeft: pTd(10),
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderColor,
  },
  subBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderWidth: 1,
    borderRightWidth: 0,
    borderColor: Colors.borderColor,
  },
  addBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderWidth: 1,
    borderLeftWidth: 0,
    borderColor: Colors.borderColor,
  },
});
