import React, {memo} from 'react';
import {View, StyleSheet} from 'react-native';
import {Touchable} from '../../../../components/template';
import {TextL} from '../../../../components/template/CommonText';
import {getWindowWidth} from '../../../../utils/common/device';
import {Colors} from '../../../../assets/theme';
import {pTd} from '../../../../utils/common';
const titleWidth = 50;
const Item = memo(props => {
  const {title, playList, showBottomBorder} = props;
  if (!playList || !Array.isArray(playList)) {
    return null;
  }

  const width = (getWindowWidth() - titleWidth) / (playList.length * 2.5);
  return (
    <View style={[styles.box, showBottomBorder && styles.bottomBorder]}>
      <TextL style={styles.titleText}>{title}</TextL>
      <View style={styles.selectBox}>
        {playList.map((item, index) => {
          return (
            <Touchable
              key={index}
              style={[
                styles.itemBox,
                {height: width, width, borderRadius: width / 2},
              ]}>
              <TextL>{item}</TextL>
            </Touchable>
          );
        })}
      </View>
    </View>
  );
});
const PlayComponent = props => {
  const {data} = props;
  return (
    <View>
      {data && data.length
        ? data.map((item, index) => {
            return (
              <Item
                {...item}
                key={index}
                showBottomBorder={index === data.length - 1}
              />
            );
          })
        : null}
    </View>
  );
};
export default memo(PlayComponent);
const styles = StyleSheet.create({
  box: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderColor,
    paddingVertical: pTd(10),
    alignItems: 'center',
    flexDirection: 'row',
  },
  bottomBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderColor,
  },
  itemBox: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.fontGray,
  },
  selectBox: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  titleText: {
    textAlign: 'center',
    width: titleWidth,
  },
});
