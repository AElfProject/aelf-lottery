import {useState, useCallback, useEffect} from 'react';
import {useSelector, shallowEqual} from 'react-redux';
import {createSelector} from 'reselect';
import {useFocusEffect} from '@react-navigation/native';

const useSetState = (initial = {}) => {
  const [state, saveState] = useState(initial);
  const setState = useCallback(newState => {
    saveState(prev => ({...prev, ...newState}));
  }, []);
  return [state, setState];
};

const useStateToProps = combiner => {
  return useSelector(
    createSelector(state => state, combiner),
    shallowEqual,
  );
};
function useEffectOnce(effect) {
  useEffect(effect, []);
}
function useFocusEffectOnce(effect) {
  useFocusEffect(useCallback(effect, []));
}
export {useSetState, useStateToProps, useEffectOnce, useFocusEffectOnce};
