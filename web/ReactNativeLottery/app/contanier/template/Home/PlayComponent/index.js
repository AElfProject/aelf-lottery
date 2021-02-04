import React, {memo, useMemo, useState} from 'react';
import {View, StyleSheet, Keyboard} from 'react-native';
import {Stepper, Touchable} from '../../../../components/template';
import {TextL, TextM} from '../../../../components/template/CommonText';
import {getWindowWidth} from '../../../../utils/common/device';
import {Colors} from '../../../../assets/theme';
import {pTd} from '../../../../utils/common';
const titleWidth = 50;
import i18n from 'i18n-js';
import {useStateToProps} from '../../../../utils/pages/hooks';
const multipleToolList = [1, 10, 50, 100];
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
  } = props;
  if (!playList || !Array.isArray(playList)) {
    return null;
  }
  const simple = playList.length < 5;
  const offset = !simple
    ? playList.length * 1.4
    : !language || language === 'en'
    ? playList.length * 1.8
    : playList.length * 2.4;

  const width = (getWindowWidth() - titleWidth) / offset;
  const fontSize =
    simple && (!language || language === 'en') ? width * 0.3 : width * 0.55;
  return (
    <View
      style={[
        styles.container,
        showBottomBorder && styles.bottomBorder,
        onTool && styles.toolContainer,
      ]}>
      <View style={[styles.box]}>
        <TextL style={styles.titleText}>{title}</TextL>
        <View style={styles.selectBox}>
          {playList.map((item, index) => {
            const current = selected?.includes(String(index));
            return (
              <Touchable
                onPress={() => onSelect(String(first), String(index))}
                key={index}
                style={[
                  styles.itemBox,
                  current && styles.currentStyle,
                  {height: width, width, borderRadius: width / 2},
                ]}>
                <TextL
                  style={[
                    styles.selectText,
                    current ? styles.whiteText : styles.blackText,
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
  const {data, betList, multiplied, setMultiplied} = props;
  const {maxMultiplied} = useStateToProps(base => {
    const {lottery} = base;
    return {
      maxMultiplied: lottery.maxMultiplied,
    };
  });
  const multipleComponent = useMemo(() => {
    return (
      <View style={styles.multipleContainer}>
        <View style={styles.selectMultiple}>
          <TextL style={styles.titleText}>{i18n.t('lottery.Times')}</TextL>
          <View style={styles.multipleToolBox}>
            {multipleToolList.map(v => {
              const selected = multiplied === v;
              return (
                <Touchable
                  key={v}
                  onPress={() => {
                    Keyboard.dismiss();
                    setMultiplied(v);
                  }}
                  style={[
                    styles.multipleItem,
                    selected && styles.selectedMultipleItem,
                  ]}>
                  <TextM
                    key={v}
                    style={{
                      color: selected ? Colors.fontWhite : Colors.fontBlack,
                    }}>
                    ×{v}
                  </TextM>
                </Touchable>
              );
            })}
          </View>
          <Stepper
            min={1}
            value={multiplied}
            max={maxMultiplied}
            onChange={setMultiplied}
            inputLeftElement={<TextM>×</TextM>}
          />
        </View>
        <TextM style={styles.multipleTip}>
          {i18n.t('lottery.TimesTip', {maxMultiplied})}
        </TextM>
      </View>
    );
  }, [maxMultiplied, multiplied, setMultiplied]);
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
      {multipleComponent}
    </View>
  );
};
export default memo(PlayComponent);
const styles = StyleSheet.create({
  selectMultiple: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  multipleToolBox: {
    paddingLeft: pTd(10),
    height: '100%',
    width: '50%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginRight: pTd(20),
  },
  multipleItem: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderColor,
    paddingHorizontal: pTd(10),
  },
  selectedMultipleItem: {
    backgroundColor: Colors.primaryColor,
    borderWidth: 0,
  },
  multipleContainer: {
    paddingVertical: pTd(12),
    paddingHorizontal: pTd(5),
    paddingRight: pTd(15),
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderColor,
  },
  multipleTip: {
    paddingLeft: pTd(10),
    marginTop: pTd(20),
    color: Colors.fontGray,
  },
  container: {
    paddingHorizontal: pTd(5),
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
    justifyContent: 'space-between',
    marginHorizontal: pTd(10),
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
  blackText: {
    color: Colors.fontBlack,
  },
});
