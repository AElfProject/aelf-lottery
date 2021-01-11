import {fork, all} from 'redux-saga/effects';
import userSaga from './userSaga';
import settingsSaga from './settingsSaga';
import lotterySaga from './lotterySaga';

/* ------------- Connect Types To Sagas ------------- */
export default function* root() {
  yield all([userSaga, settingsSaga, lotterySaga].map(fork));
}
