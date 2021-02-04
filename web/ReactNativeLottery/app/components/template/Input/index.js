'use strict';
import React, {memo, useState} from 'react';
import {TextInput, StyleSheet, View, Text} from 'react-native';
import {Colors} from '../../../assets/theme';
import Octicons from 'react-native-vector-icons/Octicons';
import {pTd} from '../../../utils/common';
import Touchable from '../Touchable';
const Input = props => {
  const {
    leftElement,
    rightElement,
    leftTitle,
    leftTitleBox,
    leftTextStyle,
    placeholderTextColor,
    disabled,
    style,
    pointerEvents,
    opacity,
    secureTextEntry,
  } = props;
  const [secureText, setSecureText] = useState(secureTextEntry);
  if (leftTitle || leftElement || rightElement || secureTextEntry) {
    return (
      <View style={[styles.leftTitleBox, leftTitleBox]}>
        {leftElement ? (
          leftElement
        ) : (
          <Text style={[styles.leftTextStyle, leftTextStyle]}>{leftTitle}</Text>
        )}
        <TextInput
          placeholderTextColor={placeholderTextColor || '#999'}
          pointerEvents={disabled ? 'none' : pointerEvents}
          opacity={disabled ? 0.6 : opacity}
          {...props}
          secureTextEntry={secureText}
          style={[styles.leftTitleInput, style]}
        />
        {rightElement ? (
          rightElement
        ) : secureTextEntry ? (
          <Touchable
            style={{padding: pTd(10)}}
            onPress={() => setSecureText(!secureText)}>
            <Octicons
              name={!secureText ? 'eye' : 'eye-closed'}
              size={pTd(35)}
            />
          </Touchable>
        ) : null}
      </View>
    );
  }
  return (
    <TextInput
      placeholderTextColor={placeholderTextColor || Colors.fontGray}
      pointerEvents={disabled ? 'none' : pointerEvents}
      opacity={disabled ? 0.6 : opacity}
      {...props}
      style={[styles.input, style]}
    />
  );
};
export default memo(Input);
const styles = StyleSheet.create({
  input: {
    color: Colors.fontBlack,
    width: '100%',
    // flex: 1,
    fontSize: 16,
    height: 50,
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    paddingHorizontal: 5,
  },
  leftTitleBox: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderColor,
  },
  leftTextStyle: {
    fontSize: 16,
  },
  leftTitleInput: {
    flex: 1,
    fontSize: 16,
    height: 50,
    paddingHorizontal: 5,
    color: Colors.fontBlack,
  },
});
