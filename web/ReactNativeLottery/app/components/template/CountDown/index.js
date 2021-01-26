import React, {Component} from 'react';

import {StyleSheet, View, Text} from 'react-native';
const styles = StyleSheet.create({
  cardItemTimeRemainTxt: {
    fontSize: 20,
    color: '#ee394b',
  },
  text: {
    fontSize: 30,
    color: '#FFF',
    marginLeft: 7,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  defaultTime: {
    fontSize: 18,
  },
  defaultColon: {
    fontSize: 18,
  },
});

class CountDown extends Component {
  static displayName = 'Simple countDown';
  static defaultProps = {
    date: new Date(),
    days: {
      plural: 'day',
      singular: 'day',
    },
    hours: ':',
    mins: ':',
    segs: ':',
    onEnd: () => {},

    secondColonStyle: styles.defaultColon,
  };
  constructor(props) {
    super(props);
    const date = this.getDateData(this.props.date);

    if (date) {
      this.state = date;
    } else {
      this.state = {
        days: 0,
        hours: 0,
        min: 0,
        sec: 0,
      };
    }
  }
  componentDidUpdate(prevProps) {
    const date = this.getDateData(prevProps.date);
    if (JSON.stringify(date) !== JSON.stringify(this.state)) {
      this.setTimer();
    }
  }
  componentDidMount() {
    this.setTimer();
  }
  setTimer = () => {
    this.interval && clearInterval(this.interval);
    this.interval = setInterval(() => {
      const date = this.getDateData(this.props.date);
      if (date) {
        this.setState(date);
      } else {
        this.stop();
        this.props.onEnd();
      }
    }, 1000);
  };
  componentWillUnmount() {
    this.stop();
  }
  getDateData(endDate) {
    let diff = (Date.parse(new Date(endDate)) - Date.parse(new Date())) / 1000;

    if (diff < 0) {
      return false;
    }

    const timeLeft = {
      years: 0,
      days: 0,
      hours: 0,
      min: 0,
      sec: 0,
      millisec: 0,
    };

    if (diff >= 365.25 * 86400) {
      timeLeft.years = Math.floor(diff / (365.25 * 86400));
      diff -= timeLeft.years * 365.25 * 86400;
    }
    if (diff >= 86400) {
      timeLeft.days = Math.floor(diff / 86400);
      diff -= timeLeft.days * 86400;
    }
    if (diff >= 3600) {
      timeLeft.hours = Math.floor(diff / 3600);
      diff -= timeLeft.hours * 3600;
    }
    if (diff >= 60) {
      timeLeft.min = Math.floor(diff / 60);
      diff -= timeLeft.min * 60;
    }
    timeLeft.sec = diff;
    return timeLeft;
  }
  render() {
    const countDown = this.state;
    let days;
    if (countDown.days === 1) {
      days = this.props.days.singular;
    } else {
      days = this.props.days.plural;
    }
    const {
      style,
      daysStyle,
      hoursStyle,
      minsStyle,
      secsStyle,
      firstColonStyle,
      secondColonStyle,
      mins,
      hours,
      segs,
    } = this.props;
    return (
      <View style={[styles.container, style]}>
        {countDown.days > 0 ? (
          <Text style={[styles.defaultTime, daysStyle]}>
            {this.leadingZeros(countDown.days) + days}
          </Text>
        ) : null}
        {countDown.hours > 0 && (
          <Text style={[styles.defaultTime, hoursStyle]}>
            {this.leadingZeros(countDown.hours)}
          </Text>
        )}
        {countDown.hours > 0 && (
          <Text style={[styles.defaultColon, firstColonStyle]}>{hours}</Text>
        )}
        <Text style={[styles.defaultTime, minsStyle]}>
          {this.leadingZeros(countDown.min)}
        </Text>
        <Text style={[styles.defaultColon, secondColonStyle]}>{mins}</Text>
        <Text style={[styles.defaultTime, secsStyle]}>
          {this.leadingZeros(countDown.sec)}
        </Text>
        <Text style={[styles.defaultColon, secondColonStyle]}>{segs}</Text>
      </View>
    );
  }
  stop() {
    clearInterval(this.interval);
  }
  leadingZeros(num, length = null) {
    let length_ = length;
    let num_ = num;
    if (length_ === null) {
      length_ = 2;
    }
    num_ = String(num_);
    while (num_.length < length_) {
      num_ = '0' + num_;
    }
    return num_;
  }
}

export default CountDown;
