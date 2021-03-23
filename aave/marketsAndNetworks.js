import { v1, v2 } from '@aave/protocol-js';

const infura_mainnet = "https://mainnet.infura.io/v3/74ce7b1c7a104effb6ab0b86ff09eaf0"
const infura_kovan = "https://kovan.infura.io/v3/ba851582c0314accaebcde9010e50e83"

const publickey = "0xCAdaa7C7597CA58351e4cA72EDa6002D163dc4b0"                        // metamask_dev
const privateKey = "cd385d59e3086a0e3eeedfbd97ca42e83656a87edc488c49c1e3a75bdb056102"  // metamask_dev


import Web3 from 'web3';

import { TxBuilderV2, Network, Market } from '@aave/protocol-js'

const LP = async () => {
    const httpProvider = new Web3.providers.HttpProvider(
        process.env.ETHEREUM_URL || infura_mainnet
    );

    const txBuilder = new TxBuilderV2(Network.main, httpProvider);
    const txBuilder = new TxBuilderV2(Network.main, httpProvider);

    // lendingPool = txBuilder.getLendingPool(Market.main);   // get all lending pool methods
}

const main = async () => {
    await LP()

}

main()