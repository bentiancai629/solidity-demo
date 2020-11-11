const fetch = require('cross-fetch');
const BN = require('bn.js');
require('console-stamp')(console, { pattern: 'yyyy-mm-dd HH:MM:ss.l' })
const {
    makeRandomPrivKey,
    privateKeyToString,
    getAddressFromPrivateKey,
    TransactionVersion,
    StacksTestnet,
    uintCV,
    tupleCV,
    makeContractCall,
    bufferCV,
    serializeCV,
    deserializeCV,
    cvToString,
    connectWebSocketClient,
    broadcastTransaction,
    standardPrincipalCV,
} = require('@blockstack/stacks-transactions');
const {
    InfoApi,
    AccountsApi,
    SmartContractsApi,
    Configuration,
    TransactionsApi,
} = require('@stacks/blockchain-api-client');
const c32 = require('c32check');

async function main() {
    const apiConfig = new Configuration({
        fetchApi: fetch,
        basePath: 'https://stacks-node-api.blockstack.org',
    });

    // generate rnadom key
    const privateKey = makeRandomPrivKey();

    // get Stacks address
    const stxAddress = getAddressFromPrivateKey(
        privateKeyToString(privateKey),
        TransactionVersion.Testnet
    );

    console.log(privateKey.data.toString('hex'))
    console.log(stxAddress)

    return stxAddress
}

main()
    .then(response => {
        // console.log(`stxAccount:${response}`)
    })
    .catch(error => {
        console.log(`error msg: ${error}`)
    })