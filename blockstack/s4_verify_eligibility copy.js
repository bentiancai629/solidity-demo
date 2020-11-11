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
    // const stxAddress = "ST23NA8PRP18S2CWBX451EH3VP5GE2GQHGQ6ZP07Y" // minner 
    const privateKeyToStringHex = '50df6be5b85038073bfc99e02695ceb5a33a3cdb0a21795a08223f683cd014a5'
    const stxAddress = `ST3BGS3XT2613ZQBQHG9R4G2FRHWRF8XBMGT8J920`

    const apiConfig = new Configuration({
        fetchApi: fetch,
        basePath: 'https://stacks-node-api.blockstack.org',
    });

    const info = new InfoApi(apiConfig);
    const poxInfo = await info.getPoxInfo();
    const coreInfo = await info.getCoreApiInfo();
    const blocktimeInfo = await info.getNetworkBlockTimes();

    console.log({ poxInfo, coreInfo, blocktimeInfo });

    // this would be provided by the user
    let numberOfCycles = 3;

    // microstacks tokens to lockup, must be >= poxInfo.min_amount_ustx and <=accountSTXBalance
    let microstacksoLockup = poxInfo.min_amount_ustx;

    // derive bitcoin address from Stacks account and convert into required format
    const hashbytes = bufferCV(Buffer.from(c32.c32addressDecode(stxAddress)[1], 'hex'));
    const version = bufferCV(Buffer.from('01', 'hex'));

    const smartContracts = new SmartContractsApi(apiConfig);

    const [contractAddress, contractName] = poxInfo.contract_id.split('.');

    // read-only contract call
    const isEligible = await smartContracts.callReadOnlyFunction({
        contractAddress,
        contractName,
        functionName: 'can-stack-stx',
        readOnlyFunctionArgs: {
            sender: stxAddress,
            arguments: [
                `0x${serializeCV(
                    tupleCV({
                        hashbytes,
                        version,
                    })
                ).toString('hex')}`,
                `0x${serializeCV(uintCV(microstacksoLockup)).toString('hex')}`,
                // explicilty check eligibility for next cycle
                `0x${serializeCV(uintCV(poxInfo.reward_cycle_id)).toString('hex')}`,
                `0x${serializeCV(uintCV(numberOfCycles)).toString('hex')}`,
            ],
        },
    });

    const response = cvToString(deserializeCV(Buffer.from(isEligible.result.slice(2), 'hex')));

    if (response.startsWith(`(err `)) {
        // user cannot participate in stacking
        // error codes: https://github.com/blockstack/stacks-blockchain/blob/master/src/chainstate/stacks/boot/pox.clar#L2
        console.log({ isEligible: false, errorCode: response });
        return;
    }
    // success
    console.log({ isEligible: true });

    // s5 add staking action
    const tx = new TransactionsApi(apiConfig);
    // const [contractAddress, contractName] = poxInfo.contract_id.split('.');
    const network = new StacksTestnet();

    const txOptions = {
        contractAddress,
        contractName,
        functionName: 'stack-stx',
        functionArgs: [
            uintCV(microstacksoLockup),
            tupleCV({
                hashbytes,
                version,
            }),
            uintCV(numberOfCycles),
            uintCV(coreInfo.burn_block_height)
        ],
        senderKey: privateKeyToStringHex,
        validateWithAbi: true,
        network
    }

    console.log(`txOptions:${JSON.stringify(txOptions)}`)
    const transaction = await makeContractCall(txOptions);
    console.log(`transaction:${JSON.stringify(transaction)}`)
    const contractCall = await broadcastTransaction(transaction, network);

    // this will return a new transaction ID
    console.log(`txid: https://testnet-explorer.blockstack.org/txid/0x${contractCall}`);
}

main()
    .then(response => {
        // console.log(`result:${response}`)
    })
    .catch(error => {
        console.log(`error msg: ${error}`)
    })