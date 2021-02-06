import main from './main-config';
import test from './test-config';
const chain = 'main';
const config = chain === 'main' ? main : test;
export default {
  ...config,
};
