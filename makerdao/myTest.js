/**
 * 
Account #3: 0x90f79bf6eb2c4f870365e785982e1f101e93b906 (10000 ETH)
Private Key: 0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6
ProxyAddress: 0x819C51F1d62a0598eE6Dc280Bf313131eC11Dd1C

Account #4: 0x15d34aaf54267db7d7c367839aaf71a00a2c6a65 (10000 ETH)
Private Key: 0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a

Account #16: 0x2546bcd3c84621e976d8185a91a922ae77ecec30 (10000 ETH)
Private Key: 0xea6c44ac03bff858b476bba40716402b03e41b8e97e276d1baec7c37d42484a0


Infura: 
https://mainnet.infura.io/v3/74ce7b1c7a104effb6ab0b86ff09eaf0
wss://mainnet.infura.io/ws/v3/74ce7b1c7a104effb6ab0b86ff09eaf0

HashQuark:
http://152.32.252.15:11122
 */
const InfuraMain = 'https://mainnet.infura.io/v3/74ce7b1c7a104effb6ab0b86ff09eaf0'
const HashQuark = 'http://152.32.252.15:11122'
const LoaclHost = 'http://127.0.0.1:8545'

const Maker = require('@makerdao/dai');
const { McdPlugin, ETH, DAI } = require('@makerdao/dai-plugin-mcd');
const Web3 = require('web3');
const web3 = new Web3(HashQuark)


// Fork HashQuark
const ownerAddress = '0x90f79bf6eb2c4f870365e785982e1f101e93b906';                         // Fork HashQuark01
const myPrivateKey = '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6'; // Fork HashQuark01

// const ownerAddress = '0x2546bcd3c84621e976d8185a91a922ae77ecec30';                         // Fork HashQuark02
// const myPrivateKey = '0xea6c44ac03bff858b476bba40716402b03e41b8e97e276d1baec7c37d42484a0'; // Fork HashQuark02

// mainnet metamask
// const ownerAddress = '0xC56Eb3021F2754a96B716BAE7e1661b023dD1517' //  !!** metamask的主网defi地址 **!!

// 基础信息
const accountInfo = async () => {
    let blockNumber = await web3.eth.getBlockNumber();
    let balanceETH = await web3.eth.getBalance(ownerAddress);

    console.log([
        `blockNumber: ${blockNumber}`,
        `owner: ${ownerAddress}`,
        `ETH: ${balanceETH}`,
    ].map(x => x.toString()))
}

// cdpManager
const mcdManager = async () => {
    const maker = await Maker.create('http', {
        plugins: [McdPlugin],
        url: HashQuark,
        privateKey: myPrivateKey
    });
    const manager = maker.service('mcd:cdpManager');
    await maker.service('proxy').ensureProxy(); // 确定是否开通了proxy合约, 如果没有则创建

    const proxyAddress = await maker.service('proxy').getProxyAddress(ownerAddress);
    const data = await manager.getCdpIds(proxyAddress); // returns list of { id, ilk } objects  [{"id":20186,"ilk":"ETH-A"},{"id":20185,"ilk":"ETH-A"},{"id":20184,"ilk":"ETH-A"}]
    const vault = await manager.getCdp(data[0].id);

    console.log([
        `vault's owner: ${ownerAddress}`,  // vault.id:20096
        `vault's proxy: ${proxyAddress}`,  // vault.id:20096
        `vault.id: ${vault.id}`,                  // vault.id:20096
        `vault.type: ${data[0].ilk}`,           // ETH-A
        `抵押ETH: ${vault.collateralAmount}`, // 持仓ETH余额
        `已借Dai: ${vault.debtValue}`,        // 借贷的dai
        `持仓总额: ${vault.collateralValue}`,  // 持仓USD余额
        `抵押率: ${vault.collateralizationRatio._amount * 100}%`, // 债务比率  {"_amount":"6.5891008076762290183","symbol":"USD/DAI"}
        `清算价格: ${vault.liquidationPrice}`  // 清算价格
    ].map(x => x.toString()))
}

// cdpType
const mcdCdpType = async () => {
    const maker = await Maker.create('http', {
        plugins: [McdPlugin],
        url: HashQuark,
    });
    const service = maker.service('mcd:cdpType');
    const ethA = service.getCdpType(null, 'ETH-A');
    //   service.cdpTypes.forEach(type => console.log(type.ilk)); // ETH-A || BAT-A || USDC-A
    const type = service.cdpTypes[0].ilk;

    console.log([
        `collateral类型: ${type} `,    // ETH-A
        `质押ETH: ${ethA.totalCollateral}`,             // 2633522.96 ETH
        `生成DAI: ${ethA.totalDebt}`,                   // 846140394.72 DAI
        `生成DAI上限: ${ethA.debtCeiling}`,             // 1000000000.00 DAI
        `质押率: ${ethA.liquidationRatio._amount * 100}%`,        // 1.50 USD/DAI
        `ETH喂价: ${ethA.price.toString()}`,              // 1431.30 USD/ETH
        `惩罚率: ${ethA.liquidationPenalty * 100}%`,    // 0.13
        `稳定费率: ${ethA.annualStabilityFee * 100}%`, // 0.03500000000012006
    ].map(x => x.toString()));

    // reset vault
    ethA.reset();
    await ethA.prefetch();

    // refresh all 
    service.resetAllCdpTypes();
    await service.prefetchAllCdpTypes();
}

const mcdSystemData = async () => {
    const maker = await Maker.create('http', {
        plugins: [McdPlugin],
        url: HashQuark,
    });

    const service = maker.service('mcd:systemData');
    const base = await service.getAnnualBaseRate();
    const line = await service.getSystemWideDebtCeiling();
    const dead = await service.isGlobalSettlementInvoked();

    console.log([
        `系统基准利率: ${base}`,
        `系统总体上限: ${line}`,
        `系统是否关闭: ${dead}`,
    ].map(x => x.toString()));
}

// Creat Vault ETH-A
const createVault = async () => {
    const maker = await Maker.create('http', {
        plugins: [McdPlugin],
        url: HashQuark,
        privateKey: myPrivateKey
    });

    console.log(`currentAddress: ${maker.currentAddress()}`);

    await maker.service('proxy').ensureProxy();
    const manager = maker.service('mcd:cdpManager');

    // openLockAndDraw
    let vault = await manager.openLockAndDraw('ETH-A',ETH(50),DAI(1000));

    console.log(`vault.id:${vault.id}`);  // vault.id:20096
    console.log(`vault.debtValue:${vault.debtValue}`); // vault.debtValue:1000.00 DAI

    // wipeAndFree
    let proxy = await maker.currentProxy();
    let cdps = await manager.getCdpIds(proxy);
    await manager.wipeAndFree(cdps[0].id, 'ETH-A', DAI(100), ETH(5));
}

const closeVault = async()=>{
    const maker = await Maker.create('http', {
        plugins: [McdPlugin],
        url: HashQuark,
        privateKey: myPrivateKey
    });

    const cdpManager = maker.service('mcd:cdpManager');
    let proxy = await maker.currentProxy();
    let cdps = await cdpManager.getCdpIds(proxy);
    // let vaultId = 20188
    await cdpManager.wipeAndFree(cdps[0].id, 'ETH-A', DAI(100), ETH(5));
    // console.log(`vault is closed: ${vault}`)
}

// Saving
const mcdSaving = async () => {
    const maker = await Maker.create('http', {
        plugins: [McdPlugin],
        url: HashQuark,
        privateKey: myPrivateKey
    });

    const service = maker.service('mcd:savings');

    // const joinResult = await service.join(DAI(1));
    const balanceOfAddress = await service.balanceOf(ownerAddress)
    const totalDaiLocked = await service.getTotalDai();
    const apyOfDai = await service.getYearlyRate();

    // console.log(`address:${ownerAddress} deposit dai to DSR: ${joinResult}`) 
    console.log([
        `${ownerAddress} 存入Dai: ${balanceOfAddress}`,  // address:0x90f79bf6eb2c4f870365e785982e1f101e93b906's balance: 0.00 DAI
        `DSR中Dai总锁定: ${totalDaiLocked}`,  // totalDaiLocked: 7118512.79 DAI
        `Dai年化收益: ${apyOfDai}`,  // DAI's Saving APY: 0
    ].map(x => x.toString()))
}

const main = async () => {
    // read-only
    await accountInfo()
    // mcdSystemData()
    // mcdManager()
    // mcdCdpType()
    // mcdSystemData()

    // write
    await createVault()
    // closeVault()
    // mcdSaving()
    await accountInfo()
}

main().catch((err) => {
    console.error('ERROR:', err);
});