import main from './main-config';
import test from './test-config';
const chain = 'main';
const config = chain === 'test' ? main : test;
export default {
  ...config,
};
