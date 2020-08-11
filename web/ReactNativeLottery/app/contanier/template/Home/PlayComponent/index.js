import React, {memo, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {Touchable} from '../../../../components/template';
import {TextL, TextM} from '../../../../components/template/CommonText';
import {getWindowWidth} from '../../../../utils/common/device';
import {Colors} from '../../../../assets/theme';
import {pTd} from '../../../../utils/common';
const titleWidth = 60;
import i18n from 'i18n-js';
import {useStateToProps} from '../../../../utils/pages/hooks';
const Item = memo(props => {
  const {language} = useStateToProps(base => {
    const {settings} = base;
    return {
      language: settings.language,
    };
  });
  const [list] = useState([
    {title: i18n.t('lottery.big'), type: 'big'},
    {title: i18n.t('lottery.small'), type: 'small'},
    {title: i18n.t('lottery.odd'), type: 'odd'},
    {title: i18n.t('lottery.even'), type: 'even'},
    {title: i18n.t('lottery.all'), type: 'all'},
    {title: i18n.t('lottery.clear'), type: 'clear'},
  ]);
  const {
    title,
    playList,
    showBottomBorder,
    first,
    onSelect,
    selected,
    onTool,
    lineLength,
  } = props;
  if (!playList || !Array.isArray(playList)) {
    return null;
  }
  const simple = playList.length < 5;
  const complex = playList.length > 10;
  const len = lineLength || complex ? 10 : playList.length;
  const offset = !simple
    ? len * 1.4
    : !language || language === 'en'
    ? len * 1.8
    : len * 2.4;

  const width = (getWindowWidth() - titleWidth) / offset;
  const fontSize =
    simple && (!language || language === 'en') ? width * 0.3 : width * 0.55;

  const marginLeft = lineLength || complex ? width / 3 : 0;
  const marginTop = lineLength || complex ? 5 : 0;
  return (
    <View
      style={[
        styles.container,
        showBottomBorder && styles.bottomBorder,
        onTool && styles.toolContainer,
      ]}>
      <View style={[styles.box]}>
        <TextL style={styles.titleText}>{title}</TextL>
        <View
          style={
            lineLength || complex ? styles.complexSelectBox : styles.selectBox
          }>
          {playList.map((item, index) => {
            const current = selected && selected.includes(String(index));
            return (
              <Touchable
                onPress={() => onSelect(String(first), String(index))}
                key={index}
                style={[
                  styles.itemBox,
                  current && styles.currentStyle,
                  {
                    height: width,
                    width,
                    borderRadius: width / 2,
                    marginLeft,
                    marginTop,
                  },
                ]}>
                <TextL
                  style={[
                    styles.selectText,
                    current && styles.whiteText,
                    {fontSize},
                  ]}>
                  {item}
                </TextL>
              </Touchable>
            );
          })}
        </View>
      </View>
      {onTool ? (
        <View style={styles.toolBox}>
          {list.map((item, index) => {
            return (
              <Touchable
                style={styles.toolItem}
                key={index}
                onPress={() => onTool(first, item.type)}>
                <TextM>{item.title}</TextM>
              </Touchable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
});
const PlayComponent = props => {
  const {data, betList} = props;
  return (
    <View>
      {data && data.length
        ? data.map((item, index) => {
            return (
              <Item
                {...item}
                key={index}
                selected={betList[index]}
                first={index}
                showBottomBorder={index === data.length - 1}
                {...props}
              />
            );
          })
        : null}
    </View>
  );
};
export default memo(PlayComponent);
const styles = StyleSheet.create({
  container: {
    paddingVertical: pTd(12),
    borderTopWidth: 1,
    borderTopColor: Colors.borderColor,
  },
  toolContainer: {
    paddingBottom: 0,
  },
  toolBox: {
    marginLeft: titleWidth + pTd(80),
    marginRight: pTd(80),
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  toolItem: {
    padding: pTd(10),
    paddingTop: pTd(5),
  },
  box: {
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
  complexSelectBox: {
    flex: 1,
    flexWrap: 'wrap',
    flexDirection: 'row',
  },
  titleText: {
    textAlign: 'center',
    width: titleWidth,
  },
  currentStyle: {
    backgroundColor: Colors.primaryColor,
  },
  selectText: {
    fontWeight: 'bold',
  },
  whiteText: {
    color: 'white',
  },
});
