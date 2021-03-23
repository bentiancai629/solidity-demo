import { TxBuilderV2, Network, Market } from '@aave/protocol-js'

const infura_kovan = "https://kovan.infura.io/v3/ba851582c0314accaebcde9010e50e83"
const privateKey = "cd385d59e3086a0e3eeedfbd97ca42e83656a87edc488c49c1e3a75bdb056102" // metamask dev

import Web3 from 'web3';

const provider = new Web3.providers.HttpProvider(
    infura_kovan
);
const web3 = new Web3(provider);
const account = web3.eth.accounts.privateKeyToAccount(privateKey);

const httpProvider = new Web3.providers.HttpProvider(
    process.env.ETHEREUM_URL ||
    infura_kovan
);
const txBuilder = new TxBuilderV2(Network.main, httpProvider);

lendingPool = txBuilder.getLendingPool(Market.main); // get all lending pool methods

console.log(`lendingPool: ${lendingPool}`);