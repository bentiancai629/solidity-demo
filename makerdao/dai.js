/**
 * 
Account #0: 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

Account #1: 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 (10000 ETH)
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

Account #2: 0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc (10000 ETH)
Private Key: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a

Infura: 
https://mainnet.infura.io/v3/74ce7b1c7a104effb6ab0b86ff09eaf0
wss://mainnet.infura.io/ws/v3/74ce7b1c7a104effb6ab0b86ff09eaf0

HashQuark:
http://152.32.252.15:11122

reposten:
https://ropsten.infura.io/v3/74ce7b1c7a104effb6ab0b86ff09eaf0
wss://ropsten.infura.io/ws/v3/74ce7b1c7a104effb6ab0b86ff09eaf0
 */

const Maker = require('@makerdao/dai');
const { McdPlugin, ETH, DAI  } = require('@makerdao/dai-plugin-mcd');

InfuraMain = 'https://mainnet.infura.io/v3/74ce7b1c7a104effb6ab0b86ff09eaf0'
HashQuark = 'http://152.32.252.15:11122'
LoaclHost = 'http://127.0.0.1:8545'


// 查询一个valut
// you provide these values
// const myPrivateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // 152.32.252.15 ganche  account0 
// const ownerAddress = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266';                         // 152.32.252.15 ganche  account0 

const myPrivateKey = '0xfc541f71b6b649cf2e31e956fa1e9a93ef6b8d62fb570964b224cdac8f7b7536'; // local ganche  account0 
// const ownerAddress = '0x5fA2866e24425Bc26c0bFf2291ad77Beb8Dbe02b';                         // local ganche  account0 

// ** my metamask mainnet **
const ownerAddress = '0xC56Eb3021F2754a96B716BAE7e1661b023dD1517'   // DSProxy: 0x317Efe1Fa2a64263855001255a5A4D6dEcCafb15

// 查看Vault信息
const lookVaultInfo = async ()=>{
    const maker = await Maker.create('http', {
        plugins: [McdPlugin],
        // url: InfuraMain,
        // url: HashQuark,
        url:LoaclHost, // 本地测试
      });

      const manager = maker.service('mcd:cdpManager');
      const proxyAddress = await maker.service('proxy').getProxyAddress(ownerAddress);
      console.log(`manager:${manager}`)
      console.log(`proxyAddress:${proxyAddress}`)
      const data = await manager.getCdpIds(proxyAddress); // returns list of { id, ilk } objects
      const vault = await manager.getCdp(data[0].id);
      
      console.log([
        vault.collateralAmount, // 头寸数量
        vault.collateralValue,  // value in USD, using current price feed values 持仓余额
        vault.debtValue,        // amount of Dai debt 债务
        vault.collateralizationRatio, // collateralValue / debt 债务比例
        vault.liquidationPrice  // vault becomes unsafe at this price 流动性价格
      ].map(x => x.toString()))
}

// 开通vault
const createVault = async () =>{
    const maker = await Maker.create('http', {
        plugins: [McdPlugin],
        url: InfuraMain,
        // url: HashQuark,
        // url:LoaclHost, // 本地测试
        privateKey: myPrivateKey
      });

    console.log(maker.currentAddress());

    // 确认是否创建了proxy合约
    await maker.service('proxy').ensureProxy();
    const manager = maker.service('mcd:cdpManager');

    const vault = await manager.openLockAndDraw(
        'ETH-A', 
        ETH(50), 
        DAI(1000)
      );
      
    //   console.log(`vault.id:${vault.id}`);  // vault.id:20096
    //   console.log(`vault.debtValue:${vault.debtValue}`); // vault.debtValue:1000.00 DAI
}


// DaiSavingRate
const daiSavingRate = async ()=>{
    const maker = await Maker.create('http',{
        plugins: [McdPlugin],
        url: InfuraMain,
        // url: HashQuark,
        // url:LoaclHost, // 本地测试
      });

    const service = maker.service('mcd:savings');
    // await service.join(DAI(1000));
    // await service.exit(DAI(1000));
    // await service.exitAll(DAI(1000));
    // await service.balance();
    // await service.balanceOf(address);
    const totalDaiLocked = await service.getTotalDai();
    const apy = await service.getYearlyRate();
    console.log(`totalDaiLocked:${totalDaiLocked}`)  // 6778644.07 DAI
    console.log(`apy:${apy}`) // 0
}


const collateralTypes = async () =>{
 
  const maker = await Maker.create('http',{
    plugins: [McdPlugin],
    url: InfuraMain,
    // url: HashQuark,
    // url:LoaclHost, // 本地测试
  });
  const service = maker.service('mcd:cdpType');
  const ethA = service.getCdpType(null, 'ETH-A');
  // service.cdpTypes.forEach(type => console.log(type.ilk));
  // ETH-A
  // BAT-A
  // USDC-A

  // this will error if more than one type is defined for ETH
  // const type = service.getCdpType(ETH);
  // console.log(type.price.toString()); // "9000.01 ETH/USD"

  // disambiguate using the ilk name string:
  console.log(ethA.price.toString()); // "1438.10 USD/ETH"
  console.log(ethA.liquidationRatio.toString());
  console.log(ethA.annualStabilityFee.toString())
  // console.log(JSON.stringify(ethA)); // "1438.10 USD/ETH"

  // reset
  // vault.reset();
  // await vault.prefetch();

  // refresh
  service.resetAllCdpTypes();
  await service.prefetchAllCdpTypes();

}

collateralTypes().catch((err) => {
    console.error('ERROR:', err);
});
