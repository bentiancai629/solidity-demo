const fetch = require('cross-fetch');
const BN = require('bn.js');
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
    // pox
    const apiConfig = new Configuration({
        fetchApi: fetch,
        basePath: 'https://stacks-node-api.blockstack.org',
    });
    const info = new InfoApi(apiConfig);
    const poxInfo = await info.getPoxInfo();
    const coreInfo = await info.getCoreApiInfo();
    const blocktimeInfo = await info.getNetworkBlockTimes();
    const [contractAddress, contractName] = poxInfo.contract_id.split('.');
}

main()