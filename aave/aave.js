
/**
 * 
 * aDAI_kovan: 0xff795577d9ac8bd7d90ee22b6c1703490b6512fd
 */
const lendingPoolABI = require('./abi/LendingPool.json');
const addressProviderABI = require('./abi/LendingPoolAddressesProvider.json');
const lendingPoolCoreABI = require("./abi/LendingPoolCore.json");
const aTokenABI = require("./abi/AToken.json");

const infura_kovan = "https://kovan.infura.io/v3/ba851582c0314accaebcde9010e50e83"

const Web3 = require('web3');
const { randomHex } = require("web3-utils");
const provider = new Web3.providers.HttpProvider(
    infura_kovan
);

const web3 = new Web3(provider);

const privateKey = "cd385d59e3086a0e3eeedfbd97ca42e83656a87edc488c49c1e3a75bdb056102" // metamask dev
const myAccount = "0xCAdaa7C7597CA58351e4cA72EDa6002D163dc4b0"
const addressProviderCA = "0x88757f2f99175387ab4c6a4b3067c77a695b0349" // kovan
const aDAIAddress = "0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD"; // kovan_aDai

/**
 * Depositing
 */
// 1. 加载LendingPoolAddressesProvider合约
const depositing = async () => {
    // Deployed Contracts - https://docs.aave.com/developers/getting-started/deployed-contracts
    // kovan_tokenAddress: https://aave.github.io/aave-addresses/kovan.json
    // mainnet: 0x24a42fD28C976A61Df5D00D0599C34c4f90748c8
    // kovan: 0x88757f2f99175387ab4c6a4b3067c77a695b0349
    // const providerInstance = new web3.eth.Contract(addressProviderABI, "0x24a42fD28C976A61Df5D00D0599C34c4f90748c8"); // mainnet

    // Add account from private key
    // web3.eth.accounts.wallet.create(0, randomHex(32));
    // const account = web3.eth.accounts.privateKeyToAccount(privateKey).address;
    // web3.eth.accounts.wallet.add(account);
    const providerInstance = new web3.eth.Contract(addressProviderABI, addressProviderCA); // kovan

    // 2. 取回lendingPool地址
    const lendingPoolAddress = await providerInstance.methods.getLendingPool().call()
        .catch((e) => {
            throw Error(`Error getting lendingPool address: ${e.message}`)
        });

    // 3. deposit
    let supplyValue = 1e18
    const value = 0
    const gas = null
    const gasPrice = web3.utils.toWei('12', "shannon");
    const callContractMethod = {
        abi: lendingPoolABI,
        contractAddress: lendingPoolAddress,
        method: "deposit",
        methodArguments: [
            aDAIAddress,
            supplyValue.toString(),
            "0xCAdaa7C7597CA58351e4cA72EDa6002D163dc4b0",
            0
        ],
        from: myAccount,
        privatekey: privateKey || null,
        gas: gas || null,
        gasPrice: gasPrice || null,
        value: value || null,
    }

    return callContractMethod

}

/**
 * borrow
 */
const borrow = async () => {
    const providerInstance = new web3.eth.Contract(addressProviderABI, addressProviderCA);
    const lendingPoolAddress = await providerInstance.methods.getLendingPool().call()
        .catch((e) => {
            throw Error(`Error getting lendingPool address: ${e.message}`)
        });

    let supplyValue = 5
    const amount = web3.utils.toWei(supplyValue.toString(), "shannon");
    const value = 0
    const gas = null
    const gasPrice = web3.utils.toWei('12', "shannon");
    const callContractMethod = {
        abi: lendingPoolABI,
        contractAddress: lendingPoolAddress,
        method: "borrow",
        methodArguments: [
            aDAIAddress,            // asset
            amount,  // amount
            2,  // interestRateMode  // Stable: 1, Variable: 2
            0,  // referralCode fee
            myAccount // onBehalfOf account
        ],

        from: myAccount,
        privatekey: privateKey || null,
        gas: gas || null,
        gasPrice: gasPrice || null,
        value: value || null,
    }

    return callContractMethod
}

/**
 * repay
 */
const repay = async () => {
    const providerInstance = new web3.eth.Contract(addressProviderABI, addressProviderCA);
    const lendingPoolAddress = await providerInstance.methods.getLendingPool().call()
        .catch((e) => {
            throw Error(`Error getting lendingPool address: ${e.message}`)
        });

    let supplyValue = 2
    const amount = web3.utils.toWei(supplyValue.toString(), "ether");
    const value = 0
    const gas = null
    const gasPrice = web3.utils.toWei('12', "shannon");
    const callContractMethod = {
        abi: lendingPoolABI,
        contractAddress: lendingPoolAddress,
        method: "repay",
        methodArguments: [
            aDAIAddress,    // asset
            amount,         // amount
            2,              // interestRateMode     // Stable: 1, Variable: 2
            myAccount       // onBehalfOf account
        ],

        from: myAccount,
        privatekey: privateKey || null,
        gas: gas || null,
        gasPrice: gasPrice || null,
        value: value || null,
    }

    return callContractMethod
}

/**
 * withdraw
 */
const withdraw = async () => {
    const providerInstance = new web3.eth.Contract(addressProviderABI, addressProviderCA);
    const lendingPoolAddress = await providerInstance.methods.getLendingPool().call()
        .catch((e) => {
            throw Error(`Error getting lendingPool address: ${e.message}`)
        });

    let supplyValue = 1
    const amount = web3.utils.toWei(supplyValue.toString(), "ether");
    const value = 0
    const gas = null
    const gasPrice = web3.utils.toWei('12', "shannon");
    const callContractMethod = {
        abi: lendingPoolABI,
        contractAddress: lendingPoolAddress,
        method: "withdraw",
        methodArguments: [
            aDAIAddress,    // asset
            amount,  // amount
            myAccount // onBehalfOf account
        ],

        from: myAccount,
        privatekey: privateKey || null,
        gas: gas || null,
        gasPrice: gasPrice || null,
        value: value || null,
    }
    return callContractMethod
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

const getUserAccountData = async () => {
    const lendingPoolContract = new web3.eth.Contract(lendingPoolABI, "0xE0fBa4Fc209b4948668006B2bE61711b7f465bAe");
    const getReserveDataCallResult = await lendingPoolContract.methods.getUserReserveData(myAccount).call() // metamask-dev
        .catch((e) => {
            throw Error(`Error getting lendingPool address: ${e.message}`)
        });

    return getReserveDataCallResult
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

const main = async () => {
    const contractResult = await depositing();
    // const contractResult = await borrow();
    // const contractResult = await repay();
    // const contractResult = await withdraw();

    // const contractResult = await getReserveData();
    const contractResult = await getUserAccountData();

    console.log(`contractResult: ${JSON.stringify(contractResult)}`);

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
        console.log("Contract Deployed, Address:", receipt.contractAddress)
        console.log("Receipt:", receipt)
    } catch (error) {
        console.log(error)
    }

    process.exit()

}

main()