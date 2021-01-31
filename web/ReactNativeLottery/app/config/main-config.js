// We use keyStore to store the private key and use information
// You can custom your keyStore config for different device.
const keystoreOptions = {
  ios: {
    dklen: 32,
    n: 2048, // 2048 4096 8192 16384
    r: 8,
    p: 1,
    cipher: 'aes-128-ctr',
  },
  android: {
    dklen: 32,
    n: 2048, // 2048 4096 8192 16384
    r: 8,
    p: 1,
    cipher: 'aes-128-ctr',
  },
};
//test tDVV
// const explorerURL = 'https://explorer-test-side01.aelf.io';
// const walletURL = 'https://tdvv-wallet-test.aelf.io';

//main tDVV
const explorerURL = 'https://tdvv-explorer.aelf.io';
const walletURL = 'https://tdvv-web-wallet.aelf.io';

// test environment
// const explorerURL = 'http://1.119.195.50:11107';
// const walletURL = 'http://1.119.195.50:11109';

const lotteryTokens = [
  {tokenSymbol: 'ELF', tokenDecimal: 8, tokenDecimalFormat: 10 ** 8},
  {tokenSymbol: 'LOT', tokenDecimal: 8, tokenDecimalFormat: 10 ** 8},
];
export default {
  commonPrivateKey:
    'b7a6b643f2a66848cb2229bf26c8330d5384e0eac325709a66f4baacc89d3108',
  // You can change the params for keyStore here
  keystoreOptions,
  httpProvider: `${walletURL}/chain`,
  explorerURL,
  // contractNames & contractAddresses will be init by appInit of `/common/utils/aelfProvider`;
  contractNames: {
    consensusContract: 'AElf.ContractNames.Consensus',
    tokenContract: 'AElf.ContractNames.Token',
  },
  // You want to init in the app
  contractAddresses: [
    {
      name: 'bingoGame',
      contractAdress: '2wRDbyVF28VBQoSPgdSEFaL4x7CaXz8TCBujYhgWc9qTMxBE3n',
      contractName: 'bingoGameContract',
    },
    {
      name: 'lottery',
      contractAdress: '2onFLTnPEiZrXGomzJ8g74cBre2cJuHrn1yBJF3P6Xu9K5Gbth',
      contractName: 'lotteryContract',
    },
  ],
  contractNameAddressSets: {
    //main tDVV
    tokenContract: '7RzVGiuVWkvL4VfVHdZfQF2Tri3sgLe9U991bohHFfSRZXuGX',
    //main AELF
    // tokenContract: 'JRmBduh4nXWi1aXgdUsj5gJrzeZb2LxmrAbf7W99faZSvoAaE',
    //test tDVV
    // lotteryContract: 'buePNjhmHckfZn9D8GTL1wq6JgA8K24SeTWnjCNcrz6Sf1FDh',
    //main tDVV
    lotteryContract: '2AsEepqiFCRDnepVheYYN5LK7nvM2kUoXgk2zLKu1Zneh8fwmF',
  },
  address: {
    prefix: 'ELF',
    suffix: 'tDVV',
  },

  // tokenSymbol: 'AEUSD',
  // tokenDecimal: 3,
  // tokenDecimalFormat: 10 ** 3,

  // test environment
  tokenSymbol: 'LOT',
  tokenDecimal: 8,
  tokenDecimalFormat: 10 ** 8,

  fetchTimeout: 10000,
  /**
   * The country you want to remind him of Please enter the iSO country code and refer to the link below
   * https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2#Officially_assigned_code_elements
   * Note that this is an array
   */
  // ISOCountryCodeBlackList: ['CN'],
  /**
   * safety lock time
   * 10 minutes by default
   * milliseconds as a unit
   */
  safeTime: 600000,
  /**
   * Each bet is worth a few gold coins
   */
  // lotterySellerAddress: 'eFU9Quc8BsztYpEHKzbNtUpu9hGKgwGD2tyL13MqtFkbnAoCZ',
  lotterySellerAddress: 'dSzLQ4LmscaxjZEBPTmyFiWBzToRNemwjYmbBtfwttegBkJrK',
  lotteryTokens,
};
