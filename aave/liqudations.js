const lendingPoolABI = require('./abi/LendingPoolMainnet2.json');
const addressProviderABI = require('./abi/LendingPoolAddressesProvider.json');
const lendingPoolCoreABI = require("./abi/LendingPoolCore.json");
const aTokenABI = require("./abi/AToken.json");
const daiABI = require("./abi/Dai.json")
const moment = require('moment');
const sleep = require('sleep');
const axios = require('axios')

// 1066701721343464284  1.06
// 1643561149442628819 1.62

// 0. 参数
const infura_kovan = "https://kovan.infura.io/v3/ba851582c0314accaebcde9010e50e83"
const ws_infura_kovan = "wss://kovan.infura.io/v3/ba851582c0314accaebcde9010e50e83"
const fork_kovan = "http://127.0.0.1:8545"
const mainnet = "http://123.58.217.106:7545"
const ws_mainnet = "ws://152.32.252.15:11122"

const Web3 = require('web3');
const web3 = new Web3(infura_kovan);

const privateKey = "cd385d59e3086a0e3eeedfbd97ca42e83656a87edc488c49c1e3a75bdb056102" // metamask dev
const myAccount = "0xCAdaa7C7597CA58351e4cA72EDa6002D163dc4b0"
const addressProviderCA = "0x88757f2f99175387ab4c6a4b3067c77a695b0349" // kovan
const daiAddress = "0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD"; // kovan_aDai

const eth = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"; // ETH_mainnet_aave_collateralAddress


// aave合约
const lendingPoolCA_kovan = "0xE0fBa4Fc209b4948668006B2bE61711b7f465bAe"
const lendingPoolCA_mainnet = "0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9"
// 1. 获取所有持仓id和address
/**
 * 监听lendingpool
 * 
 * @returns 
 */
const EventEnum = {
    lendingPoolBorrow: {
        eventType: "Borrow",
        // tableHandler: borrowRecordTb,
        contractIns: new web3.eth.Contract(lendingPoolABI, lendingPoolCA_mainnet),
    },
    lendingPoolRepay: {
        eventType: "Repay",
        // tableHandler: repayRecordTb,
        contractIns: new web3.eth.Contract(lendingPoolABI, lendingPoolCA_mainnet),
    }
}

const syncEvents = async (event, fromBlock, toBlock) => {
    let eventType = event.eventType;
    log.info(`Sync ${eventType} events from ${fromBlock} to ${toBlock}`);

    const lendingPoolInstance = new web3.eth.Contract(lendingPoolABI, lendingPoolCA_mainnet); // mainnet
    const events = await lendingPoolInstance.getPastEvents(eventType, {
        filter: {},
        fromBlock: fromBlock,
        toBlock: toBlock
    });

    log.info(`Find ${events.length} events.`);
    if (events.length <= 0) {
        return
    }

    log.info(`========> Find ${events.length} events <========`);

    let rows = []
    for (let event of events) {
        // log.info(`event log: ${JSON.stringify(event)}`);
        const block = await web3.eth.getBlock(event.blockNumber);
        const blockTimestamp = web3.utils.hexToNumber(block.timestamp);
        const mysqlTimestamp = moment(blockTimestamp * 1000).format("YYYY-MM-DD HH:mm:ss");

        switch (eventType) {
            case EventEnum.lendingPoolBorrow.eventType:
                rows.push({
                    // block: await event.blockNumber,
                    // blockTimestamp: web3.utils.hexToNumber(block.timestamp),
                    // mysqlTimestamp: moment(blockTimestamp * 1000).format("YYYY-MM-DD HH:mm:ss"),
                    user: event.address,
                    event: event.event,
                    reserve: event.returnValues.reserve,
                    onBehalfOf: event.returnValues.onBehalfOf,
                    amount: web3.utils.fromWei(event.returnValues.amount, 'ether'),
                    // borrowRateMode: event.returnValues.borrowRateMode,
                    // borrowRate: event.returnValues.borrowRate,
                    // referral: event.returnValues.referral,
                })
                break;
            default:
                log.error(`Undefined event type "${event.event}" - tx:${event.transactionHash}.`);
                return
        }

    }

    log.info(`Save ${rows.length} ${eventType} events to db...`);
    // await event.tableHandler.batchInsert(rows);
    console.log(rows);
}

/**
 * 
 * @returns 
 */
const getUserAccountData = async (account) => {
    // const lendingPoolInstance = new web3.eth.Contract(lendingPoolABI, "0xE0fBa4Fc209b4948668006B2bE61711b7f465bAe"); // kovan
    const lendingPoolInstance = new web3.eth.Contract(lendingPoolABI, lendingPoolCA_mainnet); // mainnet
    const getReserveDataCallResult = await lendingPoolInstance.methods.getUserAccountData(account).call() // TODO only mainnet？  metamask-dev 
        .catch((e) => {
            throw Error(`Error getting lendingPool address: ${e.message}`)
        });

    log.info(`getReserveDataCallResult: ${JSON.stringify(getReserveDataCallResult.healthFactor)}`)
    return getReserveDataCallResult
}

/**
 * getReserveData
 */
const getReserveData = async () => {
    const lendingPoolContract = new web3.eth.Contract(lendingPoolABI, "0xE0fBa4Fc209b4948668006B2bE61711b7f465bAe");
    const getReserveDataCallResult = await lendingPoolContract.methods.getReserveData("0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD").call() // 0xE0fBa4Fc209b4948668006B2bE61711b7f465bAe
        .catch((e) => {
            throw Error(`Error getting lendingPool address: ${e.message}`)
        });

    // console.log(`getReserveDataCallResult: ${JSON.stringify(getReserveDataCallResult)}`)
    // console.log(`variableBorrowRate: ${getReserveDataCallResult.variableBorrowRate}`);
    // const variableBorrowRate = getReserveDataCallResult.variableBorrowRate;
    // console.log((Number(variableBorrowRate.slice(0, 6) / 1000000)).toFixed(4));
    // console.log(`variableBorrowRate: ${variableBorrowRate}`);
    // console.log(getReserveDataCallResult.liquidityRate);
    // console.log(getReserveDataCallResult.variableBorrowRate);

    // console.log(getReserveDataCallResult.stableBorrowRate);
    // console.log(getReserveDataCallResult.averageStableBorrowRate);

    let results = {
        availableLiquidity: getReserveDataCallResult.availableLiquidity,
        totalStableDebt: getReserveDataCallResult.totalStableDebt,
        totalVariableDebt: getReserveDataCallResult.currentStableBorrowRate,
        liquidityRate: (Number(getReserveDataCallResult.liquidityRate.slice(0, 6) / 1000000)).toFixed(4),
        variableBorrowRate: (Number(getReserveDataCallResult.variableBorrowRate.slice(0, 6) / 1000000)).toFixed(4),
        stableBorrowRate: (Number(getReserveDataCallResult.stableBorrowRate.slice(0, 6) / 1000000)).toFixed(4),
        averageStableBorrowRate: (Number(getReserveDataCallResult.averageStableBorrowRate.slice(0, 6) / 1000000)).toFixed(4),
        liquidityIndex: getReserveDataCallResult.liquidityIndex,
        variableBorrowIndex: getReserveDataCallResult.variableBorrowIndex,
        lastUpdateTimestamp: getReserveDataCallResult.lastUpdateTimestamp,
    };

    return results
}

// 2. 解析factor和持仓信息


// Input variables

// 3. liquidationCall()
const liquidationCall = async (collateralAddress, tokenAddress, user, amountInEther, receiveATokens) => {
    // const lendingPoolInstance = new web3.eth.Contract(lendingPoolABI, "0xE0fBa4Fc209b4948668006B2bE61711b7f465bAe")
    const amountInWei = web3.utils.toWei(amountInEther.toString(), "ether");
    const value = 0
    const gas = 30000
    const gasPrice = web3.utils.toWei('30', "shannon");
    const callContractMethod = {
        abi: lendingPoolABI,
        contractAddress: "0xE0fBa4Fc209b4948668006B2bE61711b7f465bAe",
        method: "liquidationCall",
        methodArguments: [
            collateralAddress,    // asset
            tokenAddress,  // amount
            user, // onBehalfOf account
            amountInWei,
            receiveATokens
        ],

        from: myAccount,
        privatekey: privateKey || null,
        gas: gas || null,
        gasPrice: gasPrice || null,
        value: value || null,
    }
    return callContractMethod
}


const theGraphAPI = async () => {
    const axios = require('axios')

    axios.post('https://api.thegraph.com/subgraphs/name/aave/protocol', {
        query: `
  {
    flashLoans(first: 10, orderBy: timestamp, orderDirection: desc) {
      id
      reserve {
        name
        symbol
      }
      amount,
      target,
      timestamp
    }
  }  
  `
    })
        .then((res) => {
            for (const flashsloan of res.data.data.flashLoans) {
                console.log(flashsloan)
            }
        })
        .catch((error) => {
            console.error(error)
        })

}

let log = {
    info: function (msg) {
        console.info(`[${moment().format()}] | ${msg}`)
    },
    error: function (msg) {
        console.error(`[${moment().format()}] | ${msg}`)
    },
};


const main = async () => {
    let keys = Object.keys(EventEnum); // lendingPoolBorrow,lendingPoolRepay
    let i = 0;
    while (true) {
        let event = EventEnum[keys[i % keys.length]];
        let eventType = EventEnum[keys[i % keys.length]].eventType;
        log.info(`=======> Event sync running #${i} with type ${eventType}`);
        // 计算区块高度
        let checkPoint = 12107290
        // let checkPoint = Math.max(parseInt(process.env.SWAP_CONTRACT_DEPLOYED_AT_BLOCK), await syncCheckpointTb.getByType(eventType) - 1);
        let currentHeight = await web3.eth.getBlockNumber();
        log.info(`Current height ${currentHeight}, checkPoint ${checkPoint}`);
        let nextCheckpoint = Math.min(currentHeight - 2, checkPoint + parseInt(process.env.EVENT_SYNC_BATCH_BLOCKS));
        await syncEvents(event, checkPoint, 12107300);
        await getUserAccountData("0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9");
        // await syncCheckpointTb.insert(eventType, nextCheckpoint);
        i++;
        sleep.sleep(5);
    }
}

// tokenApprove()
const tokenApproveEncode = async(assetABI, assetAddress, approveToAddress, amountInEther) =>{
    const amountInWei = web3.utils.toWei(amountInEther.toString(), "ether");
    const value = 0
    const gas = 30000
    const gasPrice = web3.utils.toWei('30', "shannon");
    const callContractMethod = {
        abi: assetABI,
        contractAddress: assetAddress,
        method: "approve",
        methodArguments: [
            approveToAddress,    // asset
            amountInWei
        ],

        from: myAccount,
        privatekey: privateKey || null,
        gas: gas || null,
        gasPrice: gasPrice || null,
        value: value || null,
    }

    return callContractMethod
}

const tokenApprove = async(assetABI, assetAddress, approveToAddress, amountInEther) => {
    const contractResult = await tokenApproveEncode(assetABI, assetAddress, approveToAddress, amountInEther);
    const abi = contractResult.abi;
    const contractAddress = contractResult.contractAddress;
    const method = contractResult.method;
    const methodArguments = contractResult.methodArguments;
    const from = contractResult.from;
    const privatekey = contractResult.privatekey || null
    const gas = contractResult.gas || null
    const gasPrice = contractResult.gasPrice || null
    const value = contractResult.value || null

    try {
        const receipt = await CallContractMethod(
            abi, contractAddress, method, methodArguments, from, privatekey, gas, gasPrice, value
        )

        console.log("Receipt:", receipt)
    } catch (error) {
        console.log(error)
    }

    process.exit()
}



const liqudationCall = async () => {
    const collateralAddressDAI = '0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD' //DAI kovan
    const collateralAddressWETH = '0xf8aC10E65F2073460aAD5f28E1EABE807DC287CF' //WETH kovan

    const daiAddress = '0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD' // kovan DAI
    // const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F' // mainnet DAI
    // const daiAmountInWei = web3.utils.toWei("1000", "ether").toString()
    const amountInEther = 1
    const user = myAccount
    const receiveATokens = true
    const contractResult = await liquidationCall(collateralAddressDAI, daiAddress, user, amountInEther, receiveATokens);
    // const contractResult = await liquidationCall(collateralAddressWETH, daiAddress, user, amountInEther, receiveATokens);

    // console.log(`contractResult: ${JSON.stringify(contractResult)}`);

    // return
    const abi = contractResult.abi;
    const contractAddress = contractResult.contractAddress;
    const method = contractResult.method;
    const methodArguments = contractResult.methodArguments;
    const from = contractResult.from;
    const privatekey = contractResult.privatekey || null
    const gas = contractResult.gas || null
    const gasPrice = contractResult.gasPrice || null
    const value = contractResult.value || null

    try {
        const receipt = await CallContractMethod(
            abi, contractAddress, method, methodArguments, from, privatekey, gas, gasPrice, value
        )
        // console.log("Contract Deployed, Address:", receipt.contractAddress)
        console.log("Receipt:", receipt)
    } catch (error) {
        console.log(error)
    }

    process.exit()
}

const liqudationOffcialCall = async () => {
    const collateralAddress = '0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD'
    const daiAddress = '0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD' // kovan DAI
    const user = myAccount
    const daiAmountInWei = web3.utils.toWei("1", "ether").toString()
    const receiveATokens = true

    const lpAddressProviderAddress = '0x88757f2f99175387ab4c6a4b3067c77a695b0349' // kovan
    const lendingPoolAddress = '0xE0fBa4Fc209b4948668006B2bE61711b7f465bAe' // kovan

    // const lpAddressProviderContract = new web3.eth.Contract(lendingPoolABI, lpAddressProviderAddress)

    // Get the latest LendingPoolCore address
    // const lpCoreAddress = await lpAddressProviderContract.methods
    // .getLendingPoolCore()
    // .call()
    // .catch((e) => {
    //     throw Error(`Error getting lendingPool address: ${e.message}`)
    // })

    // Approve the LendingPoolCore address with the DAI contract
      // Get the latest LendingPool contract address
    // const lpAddress = await lpAddressProviderContract.methods
    //     .getLendingPool()
    //     .call()
    //     .catch((e) => {
    //         throw Error(`Error getting lendingPool address: ${e.message}`)
    //     })

    // const tokenApproveResult = await tokenApprove(myAccount,2)
    // console.log(`tokenApproveResult: ${JSON.stringify(tokenApproveResult)}`)
  
    // Make the deposit transaction via LendingPool contract
    // const lpContract = new web3.eth.Contract(lendingPoolABI, "0xE0fBa4Fc209b4948668006B2bE61711b7f465bAe")
    // await lpContract.methods
    //     .liquidationCall(
    //         collateralAddress,
    //         daiAddress,
    //         user,
    //         daiAmountInWei,
    //         receiveATokens,
    //     )
    const liquidationResult = await liquidationCall(collateralAddress,daiAddress,user,daiAmountInWei,receiveATokens);
    await CallContractMethod()
}

async function CallContractMethod(abi, contractAddress, method, arguments, from, privatekey, gas, gasPrice, value) {
    const myContract = new web3.eth.Contract(abi, contractAddress);

    const contractMethod = myContract.methods[method](...arguments)

    const txData = contractMethod.encodeABI();

    if (!gas) {
        gas = await contractMethod.estimateGas({
            from: from,
            value: value
        })
    }

    const tx = {
        from: from,
        to: contractAddress,
        data: txData,
        gas: gas,
    };

    if (gasPrice) {
        tx['gasPrice'] = gasPrice;
    }

    if (value) {
        tx['value'] = value
    }

    // console.log(tx)

    var signedTx = await web3.eth.accounts.signTransaction(tx, privatekey)

    var receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    return receipt
}


// main()

// tokenApprove(daiABI, daiAddress,lendingPoolCA_kovan, 10)
// tokenApprove(daiABI, daiAddress,myAccount, 10)

// liqudationOffcialCall()
liqudationCall()