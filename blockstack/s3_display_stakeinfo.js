const fetch = require('cross-fetch')
const BN = require('bn.js')
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
    // const stxAddress = "ST23NA8PRP18S2CWBX451EH3VP5GE2GQHGQ6ZP07Y"   // minner STX
    const privateKeyToStringHex = '50df6be5b85038073bfc99e02695ceb5a33a3cdb0a21795a08223f683cd014a5' // test STX
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

    // will Stacking be executed in the next cycle?
    const stackingExecution = poxInfo.rejection_votes_left_required > 0;

    // how long (in seconds) is a Stacking cycle?
    const cycleDuration = poxInfo.reward_cycle_length * blocktimeInfo.testnet.target_block_time;

    // how much time is left (in seconds) until the next cycle begins?
    const secondsToNextCycle =
        (poxInfo.reward_cycle_length -
            ((coreInfo.burn_block_height - poxInfo.first_burnchain_block_height) %
                poxInfo.reward_cycle_length)) *
        blocktimeInfo.testnet.target_block_time;

    // the actual datetime of the next cycle start
    const nextCycleStartingAt = new Date();
    nextCycleStartingAt.setSeconds(nextCycleStartingAt.getSeconds() + secondsToNextCycle);

    console.log({
        stackingExecution,
        cycleDuration,
        nextCycleStartingAt,
        // minimum microstacks required to participate
        minimumUSTX: poxInfo.min_amount_ustx, // 83.335331250000
    });

    // verify stx balance
    const accounts = new AccountsApi(apiConfig)
    
    const accountBalance = await accounts.getAccountBalance({
        principal: stxAddress,
    });

    const accountSTXBalance = new BN(accountBalance.stx.balance, 10);
    const minAmountSTX = new BN(poxInfo.min_amount_ustx, 10);

    // enough balance for participation?
    const canParticipate = accountSTXBalance.cmp(minAmountSTX) >= 0;

    console.log({
        stxAddress,
        btcAddress: c32.c32ToB58(stxAddress),
        accountSTXBalance: accountSTXBalance.toNumber(),
        minAmountSTX:minAmountSTX.toString(),
        canParticipate,
    })

    let numberOfCycles = 3

    // the projected datetime for the unlocking of tokens
    const unlockingAt = new Date(nextCycleStartingAt);
    unlockingAt.setSeconds(
        unlockingAt.getSeconds() +
        poxInfo.reward_cycle_length * numberOfCycles * blocktimeInfo.testnet.target_block_time
    );

    console.log(`unlockingAt:${unlockingAt}`)
}

main()
    .then(response => {
        // console.log(`result:${response}`)
    })
    .catch(error => {
        console.log(`error msg: ${error}`)
    })