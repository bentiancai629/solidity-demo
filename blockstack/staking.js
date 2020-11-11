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


async function staking() {

}

async function main1() {
    // s2. generating an account
    const apiConfig = new Configuration({
        fetchApi: fetch,
        basePath: 'https://stacks-node-api.blockstack.org',
    });
    // generate rnadom key
    // const privateKey = makeRandomPrivKey();

    // // get Stacks address
    // const stxAddress = getAddressFromPrivateKey(
    //     privateKeyToString(privateKey),
    //     TransactionVersion.Testnet
    // );

    const privateKey = '50df6be5b85038073bfc99e02695ceb5a33a3cdb0a21795a08223f683cd014a5'
    const stxAddress = `ST3BGS3XT2613ZQBQHG9R4G2FRHWRF8XBMGT8J920`
    console.log(`privateKey: ${privateKey}`)
    console.log(`stxAddress: ${stxAddress}`)

    // s3. display stacking info
    const info = new InfoApi(apiConfig);
    const poxInfo = await info.getPoxInfo();
    const coreInfo = await info.getCoreApiInfo();
    const blocktimeInfo = await info.getNetworkBlockTimes();

    console.log({ poxInfo, coreInfo, blocktimeInfo });

    // staking executed
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
        minimumUSTX: poxInfo.min_amount_ustx,
    });

    // account info
    const accounts = new AccountsApi(apiConfig);

    const accountBalance = await accounts.getAccountBalance({
        principal: stxAddress,
    });

    const accountSTXBalance = new BN(accountBalance.stx.balance, 10);
    const minAmountSTX = new BN(poxInfo.min_amount_ustx, 10);

    // enough balance for participation?
    const canParticipate = accountSTXBalance.cmp(minAmountSTX) >= 0;
    const res = {
        stxAddress,
        btcAddress: c32.c32ToB58(stxAddress),
        accountSTXBalance: accountSTXBalance.toNumber(),
        canParticipate,
    }
    console.log(`staking execute result:${JSON.stringify(res)}`)

    // faucet 
    // curl -XPOST "https://stacks-node-api.blockstack.org/extended/v1/faucets/stx?address=<stxAddress>&stacking=true"

    // this would be provided by the user
    let numberOfCycles = 3;

    // the projected datetime for the unlocking of tokens
    const unlockingAt = new Date(nextCycleStartingAt);
    unlockingAt.setSeconds(
        unlockingAt.getSeconds() +
        poxInfo.reward_cycle_length * numberOfCycles * blocktimeInfo.testnet.target_block_time
    );

    // s4. verify elgibilitiy
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

    // this would be provided by the user
    let numberOfCycles = 3;

    // the projected datetime for the unlocking of tokens
    const unlockingAt = new Date(nextCycleStartingAt);
    unlockingAt.setSeconds(
        unlockingAt.getSeconds() +
        poxInfo.reward_cycle_length * numberOfCycles * blocktimeInfo.testnet.target_block_time
    );

    // s5. add staking action
    const tx = new TransactionsApi(apiConfig);

    const [contractAddress, contractName] = poxInfo.contract_id.split('.');
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
        ],
        senderKey: privateKey.data.toString('hex'),
        validateWithAbi: true,
        network,
    };

    const transaction = await makeContractCall(txOptions);

    const contractCall = await broadcastTransaction(transaction, network);

    // this will return a new transaction ID
    console.log("contractCall: ", contractCall);


    // s6. confirm lock-up
    const waitForTransactionSuccess = txId =>
        new Promise((resolve, reject) => {
            const pollingInterval = 3000;
            const intervalID = setInterval(async () => {
                const resp = await tx.getTransactionById({ txId });
                if (resp.tx_status === 'success') {
                    // stop polling
                    clearInterval(intervalID);
                    // update UI to display stacking status
                    return resolve(resp);
                }
            }, pollingInterval);
        });

    const resp = await waitForTransactionSuccess(contractCall.txId);

    // s7. Alternatively to the polling
    // const client = await connectWebSocketClient('ws://stacks-node-api.blockstack.org/');

    // const sub = await client.subscribeAddressTransactions(contractCall.txId, event => {
    //     console.log(event);
    //     // update UI to display stacking status
    // });

    // await sub.unsubscribe();

    // s6. display stacking status
    const [contractAddress, contractName] = poxInfo.contract_id.split('.');
    const functionName = 'get-stacker-info';

    const stackingInfo = await smartContracts.callReadOnlyFunction({
        contractAddress,
        contractName,
        functionName,
        readOnlyFunctionArgs: {
            sender: stxAddress,
            arguments: [`0x${serializeCV(standardPrincipalCV(stxAddress)).toString('hex')}`],
        },
    });

    const response = deserializeCV(Buffer.from(stackingInfo.result.slice(2), 'hex'));

    const data = response.value.data;

    console.log({
        lockPeriod: cvToString(data['lock-period']),
        amountSTX: cvToString(data['amount-ustx']),
        firstRewardCycle: cvToString(data['first-reward-cycle']),
        poxAddr: {
            version: cvToString(data['pox-addr'].data.version),
            hashbytes: cvToString(data['pox-addr'].data.hashbytes),
        },
    });
}




async function main() {
    const newAccount = () => {
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

        console.log(`privateKey: ${privateKey}`)
        console.log(`stxAddress: ${stxAddress}`)
    }

    const infoApi = async () => {
        const info = new InfoApi(apiConfig);
        const poxInfo = await info.getPoxInfo();
        const coreInfo = await info.getCoreApiInfo();
        const blocktimeInfo = await info.getNetworkBlockTimes();
        console.log({ poxInfo, coreInfo, blocktimeInfo });
    }

    const stakingInfo = async () => {
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
            minimumUSTX: poxInfo.min_amount_ustx,
        });
    }

    const accountInfo = async () => {
        // 创建账户
        const accounts = new AccountsApi(apiConfig);

        const accountBalance = await accounts.getAccountBalance({
            principal: stxAddress,
        });

        const accountSTXBalance = new BN(accountBalance.stx.balance, 10);
        const minAmountSTX = new BN(poxInfo.min_amount_ustx, 10);

        // enough balance for participation?
        const canParticipate = accountSTXBalance.cmp(minAmountSTX) >= 0;



    }

    // 执行faucet
    // curl -XPOST "https://stacks-node-api.blockstack.org/extended/v1/faucets/stx?address=<stxAddress>&stacking=true"

    const unlock = async () => {
        // this would be provided by the user
        let numberOfCycles = 3;

        // the projected datetime for the unlocking of tokens
        const unlockingAt = new Date(nextCycleStartingAt);
        unlockingAt.setSeconds(
            unlockingAt.getSeconds() +
            poxInfo.reward_cycle_length * numberOfCycles * blocktimeInfo.testnet.target_block_time
        );
    }

    const accountSTXBalance = new BN(accountBalance.stx.balance, 10);
    const minAmountSTX = new BN(poxInfo.min_amount_ustx, 10);

    // enough balance for participation?
    const canParticipate = accountSTXBalance.cmp(minAmountSTX) >= 0;

    res.json({
        stxAddress,
        btcAddress: c32.c32ToB58(stxAddress),
        accountSTXBalance: accountSTXBalance.toNumber(),
        canParticipate,
    });

    newAccount()
    // infoApi()
    // accountInfo()
    // unlock()
}

main1()
    .then(response => {
        console.log(`result`)
    })
    .catch(error => {
        console.log(`error msg: ${error}`)
    })




/**
 * PoX, core, and block time information
 *
 * {
    poxInfo: {
    contract_id: 'ST000000000000000000002AMW42H.pox',
    first_burnchain_block_height: 0,
    min_amount_ustx: 83334707291666,
    registration_window_length: undefined,
    rejection_fraction: 3333333333333333,
    reward_cycle_id: 14,
    reward_cycle_length: 120,
    rejection_votes_left_required: 12,
    total_liquid_supply_ustx: 40000659500000000
    },
    coreInfo: {
    limit: undefined,
    peer_version: 385875968,
    burn_consensus: undefined,
    burn_block_height: 1748,
    stable_burn_consensus: undefined,
    stable_burn_block_height: 1747,
    server_version: 'blockstack-core 0.0.1 => 23.0.0.0 (HEAD:a4deb7a+, release build, linux [x86_64])',
    network_id: 2147483648,
    parent_network_id: 3669344250,
    stacks_tip_height: 1436,
    stacks_tip: 'd05be8a2eed7f6d3b7c4c73f5c7db59dd1e3b170cba10ffb7f61c4d171fa42b5',
    stacks_tip_burn_block: undefined,
    exit_at_block_height: null
    },
    blocktimeInfo: {
    mainnet: { target_block_time: 600 },
    testnet: { target_block_time: 120 }
    }
 }
 */