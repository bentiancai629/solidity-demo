/**
 * @describe monitior compound interest rate
 * @author Eric Ni
 */
require("dotenv").config()
require('console-stamp')(console, { pattern: 'yyyy-mm-dd HH:MM:ss.l' })
const cron = require("node-cron");
const config = require('../compound-monitor/config/contract_config')
const Web3 = require('web3');
const { cEthAbi, comptrollerAbi, priceFeedAbi, cErcAbi, erc20Abi } = require('./contracts.json');
const web3 = new Web3('http://127.0.0.1:8545');

/**
 * public_key: 0x5fA2866e24425Bc26c0bFf2291ad77Beb8Dbe02b
 * private_key: 0xfc541f71b6b649cf2e31e956fa1e9a93ef6b8d62fb570964b224cdac8f7b7536
 */
const myAddress = '0x5fA2866e24425Bc26c0bFf2291ad77Beb8Dbe02b';
const privateKey = '0xfc541f71b6b649cf2e31e956fa1e9a93ef6b8d62fb570964b224cdac8f7b7536';
const provider = 'http://localhost:8545';

// 初始化钱包
const EthAddress = process.env.ETH_ADDRESS

// init Compound controller contract
const comptrollerAddress = '0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b';
const comptroller = new web3.eth.Contract(comptrollerAbi, comptrollerAddress);

// initial cETH
const cEthAddress = '0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5';
const cEth = new web3.eth.Contract(cEthAbi, cEthAddress);

// initial Dai
const DaiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F'; // Dai
const Dai = new web3.eth.Contract(erc20Abi, DaiAddress);

// initial cDai
const cDaiAddress = '0x5d3a536e4d6dbd6114cc1ead35777bab948e3643'; // cDai
const cDai = new web3.eth.Contract(cErcAbi, cDaiAddress);
const assetName = 'DAI'; // for the log output lines
const underlyingDecimals = 18; // Number of decimals defined in this ERC20 token's contract

// initial wBTC
// const cWBTCAddress = '0x5d3a536e4d6dbd6114cc1ead35777bab948e3643'; // cDai
// const cWBTC = new web3.eth.Contract(cErcAbi, cDaiAddress);
// const assetName = 'cWBTC'; // for the log output lines
// const underlyingDecimals = 8; // Number of decimals defined in this ERC20 token's contract

const getCoinInfo = (tokenName) => {
  let assetName = token
  let assetCTokenName = "c" + tokenName
  let cTokenAddress = config.mainnet.Tokens
}

// initial price oracle
const priceFeedAddress = '0x922018674c12a7f0d394ebeef9b58f186cde13c1';
const priceFeed = new web3.eth.Contract(priceFeedAbi, priceFeedAddress);

// get account balances in cPool
const logBalances = () => {

  return new Promise(async (resolve, reject) => {

    let myWalletEthBalance = + web3.utils.fromWei(await web3.eth.getBalance(EthAddress));
    let myWalletCEthBalance = await cEth.methods.balanceOf(EthAddress).call() / 1e8;
    let myWalletUnderlyingBalance = +await Dai.methods.balanceOf(EthAddress).call() / Math.pow(10, underlyingDecimals);

    console.log(`ETH Balance:${myWalletEthBalance}`);
    console.log(`CEthBalance:${myWalletCEthBalance}`);
    console.log(`cDaiBalance:${myWalletUnderlyingBalance}`);

    resolve();
  });
};

/**
 * @dev get supply and borrow APY
 */
const APY = () => {
  return new Promise(async (resolve, reject) => {
    const ethMantissa = 1e18;
    const blocksPerDay = 4 * 60 * 24;
    const daysPerYear = 365;

    const cDai = new web3.eth.Contract(cEthAbi, cEthAddress);
    const supplyRatePerBlock = await cDai.methods.supplyRatePerBlock().call();
    const borrowRatePerBlock = await cDai.methods.borrowRatePerBlock().call();

    const supplyApy = (((Math.pow((supplyRatePerBlock / ethMantissa * blocksPerDay) + 1, daysPerYear - 1))) - 1) * 100;
    const borrowApy = (((Math.pow((borrowRatePerBlock / ethMantissa * blocksPerDay) + 1, daysPerYear - 1))) - 1) * 100;

    console.log(`Supply APY for ETH ${supplyApy} %`);
    console.log(`Borrow APY for ETH ${borrowApy} %`);
  });
}

/**
 * borrow.js
 */
const Compound = require('@compound-finance/compound-js');
const compound = new Compound(provider, { privateKey });
const getDaiBalance = (address) => {
  const daiAddress = Compound.util.getAddress(Compound.DAI);
  console.log(`Compound.DAI:${Compound.DAI}`)
  console.log(`daiAddress:${daiAddress}`)

  return Compound.eth.read(
    daiAddress,
    'function balanceOf(address) returns (uint256)',
    [address],
    { provider }
  );
};

const mainBorrow = async () => {
  console.log('Mainnet : ', Compound.util.getNetNameWithChainId(1337));

  // Account
  const account = await Compound.api.account({
    "addresses": myAddress,
    "network": "mainnet"
  });

  let daiBorrowBalance = 0;
  // 借贷过的账户
  if (Object.isExtensible(account) && account.accounts) {
    account.accounts.forEach((acc) => {
      acc.tokens.forEach((tok) => {
        if (tok.symbol === Compound.cDAI) {
          daiBorrowBalance = +tok.borrow_balance_underlying.value;
        }
      });
    });
  }
  console.log('daiBorrowBalance', daiBorrowBalance);

  // cToken
  const cDaiData = await Compound.api.cToken({
    "addresses": Compound.util.getAddress(Compound.cDAI)
  });
  // console.log('cDaiData', cDaiData); // JavaScript Object

  // supply
  // console.log('Supplying ETH to the Compound Protocol...');
  // const trx = await compound.supply(Compound.ETH, 10);
  // console.log('Ethers.js transaction object', trx);

  // Redeem
  // console.log('Redeeming ETH...');
  // const trx = await compound.redeem(Compound.ETH, 1); // also accepts cToken args
  // console.log('Ethers.js transaction object', trx);

  // borrow
  // const daiScaledUp = '32000000000000000000';
  // const trxOptions = { mantissa: true };

  // console.log('Borrowing 32 Dai...');
  // const trx = await compound.borrow(Compound.DAI, daiScaledUp, trxOptions);
  // console.log('Ethers.js transaction object', trx);

  // Repay Borrow
  // console.log('Repaying Dai borrow...');
  // const address = null; // set this to any address to repayBorrowBehalf
  // const trx = await compound.repayBorrow(Compound.DAI, 32, address);
  // console.log('Ethers.js transaction object', trx);

}


const main2 = async () => {
  let cTokenList = config.mainnet.cTokens
  let cTokenListJson = JSON.stringify(config.mainnet.cTokens)
  // console.log(cTokenList)
  console.log(`支持的币种数量: ${Object.getOwnPropertyNames(cTokenList).length}`)
  console.log(`支持的币种列表: ${Object.getOwnPropertyNames(cTokenList)}`)
  let map = new Map(Object.entries(cTokenList))
  map.forEach((value, key) => {
    // console.log("cToken: %s,  symbol: %s", key, value.symbol);
  })

  // 账户的ETH DAI余额 借贷的dai
  await logBalances();

  // Account
  const account = await Compound.api.account({
    "addresses": myAddressImToken,
    "network": "mainnet"
  });

  let daiBorrowBalance = 0;
  // 借贷过的账户
  if (Object.isExtensible(account) && account.accounts) {
    account.accounts.forEach((acc) => {
      acc.tokens.forEach((tok) => {
        if (tok.symbol === Compound.cDAI) {
          daiBorrowBalance = +tok.borrow_balance_underlying.value;
        }
      });
    });
  }
  console.log('daiBorrowBalance', daiBorrowBalance);
}

const main1 = async () => {
  let currentBlockNumber = await web3.eth.getBlockNumber();
  console.log(`<<<<<<<<<<<<<<<<<< check account in ${currentBlockNumber} --------------------`)
  await logBalances();
  console.log(config.mainnetAddress)

  await APY();

  // calculate liquidity value
  let { 1: liquidity } = await comptroller.methods.getAccountLiquidity(EthAddress).call();
  liquidity = liquidity / 1e18;

  // borrow rate
  let borrowRate = await cDai.methods.borrowRatePerBlock().call();
  borrowRate = borrowRate / Math.pow(10, borrowRate);

  // oracle && calculate collateral value
  let { 1: collateralFactor } = await comptroller.methods.markets(cEthAddress).call();
  collateralFactor = (collateralFactor / 1e18) * 100; // Convert to percent

  let cDaiPriceInUsd = await priceFeed.methods.price(assetName).call();
  cDaiPriceInUsd = cDaiPriceInUsd / 1e6; // Price feed provides price in USD with 6 decimal places

  console.log(`Total LIQUID assets: ${liquidity} USD in the cpooled`);
  console.log(`Current DAI/ETH price: 1 ${assetName} == ${cDaiPriceInUsd.toFixed(6)} USD`);
  console.log(`DAI borrow-rate : ${borrowRate}`);
  console.log(`Maximum DAI to borrow : ${liquidity / cDaiPriceInUsd} ${assetName}`);
  console.log(`-------------------- check account in cPool done >>>>>>>>>>>>>>>>>>>>>>>>>>`)

  return `task executed success`
}

main()

/**
 * @dev schedule task
 * @param cronExpression string crontab exprssion
 */
// cron.schedule(process.env.CRON_EXPRESSION, () => {
//   console.log(`start at:`, Date());
//     main()
//       .then(function (msg) {
//         console.log(`execute success:`, JSON.stringify(msg));
//       })
//       .catch(function (ex) {
//         console.log(`execute failed:`, JSON.stringify(ex));
//       });
// })