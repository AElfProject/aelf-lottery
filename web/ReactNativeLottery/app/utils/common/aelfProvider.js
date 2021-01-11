import AElf from 'aelf-sdk';
import config from '../../config';
const {sha256} = AElf.utils;
const {fetchTimeout} = config;
const aelf = new AElf(
  new AElf.providers.HttpProvider(config.httpProvider, fetchTimeout),
);

async function getContract(privateKeyInput, contractNameAddressSets) {
  const privateKey = privateKeyInput || config.commonPrivateKey;
  const wallet = AElf.wallet.getWalletByPrivateKey(privateKey);
  const contractInstances = {};

  const promise = Object.entries(contractNameAddressSets).map(
    ([contractName, contractAdress]) => {
      return aelf.chain
        .contractAt(contractAdress, wallet)
        .then(contractInstance => {
          contractInstances[contractName] = contractInstance;
        });
    },
  );
  return Promise.all(promise).then(() => {
    return contractInstances;
  });
}
const getOtherContracts = wallet => {
  const {contractAddresses} = config;
  const contractInstances = {};
  const promise = contractAddresses.map(({contractName, contractAdress}) => {
    return aelf.chain
      .contractAt(contractAdress, wallet)
      .then(contractInstance => {
        contractInstances[contractName] = contractInstance;
      });
  });
  return Promise.all(promise)
    .then(() => {
      return contractInstances;
    })
    .catch(err => {
      throw err;
    });
};

const getContractAddresses = zeroC => {
  const {contractNames} = config;
  const contractNameAddressKeyValues = {};
  const promise = Object.entries(contractNames).map(
    ([contractName, addressName]) => {
      return zeroC.GetContractAddressByName.call(sha256(addressName)).then(
        result => {
          contractNameAddressKeyValues[contractName] = result;
        },
      );
    },
  );
  return Promise.all(promise).then(() => contractNameAddressKeyValues);
};
async function initContracts(privateKey) {
  const chainStatus = await aelf.chain.getChainStatus();
  const {
    // directly accessible information
    GenesisContractAddress,
  } = chainStatus;
  const wallet = AElf.wallet.getWalletByPrivateKey(privateKey);
  const zeroC = await aelf.chain.contractAt(GenesisContractAddress, wallet);
  const contractNameAddressSets = await getContractAddresses(zeroC);
  console.log(contractNameAddressSets, '====contractNameAddressSets');
  return await getContract(privateKey, {...contractNameAddressSets});
}
const aelfInstance = aelf;

export {getContract, getOtherContracts, aelfInstance, initContracts};
