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
HashQuark = 'http://152.32.252.15:8545'
LoaclHost = 'http://127.0.0.1:8545'





// 查询一个valut
// you provide these values
// const myPrivateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // 152.32.252.15 ganche  account0 
// const ownerAddress = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266';                         // 152.32.252.15 ganche  account0 

const myPrivateKey = '0xfc541f71b6b649cf2e31e956fa1e9a93ef6b8d62fb570964b224cdac8f7b7536'; // local ganche  account0 
const ownerAddress = '0x5fA2866e24425Bc26c0bFf2291ad77Beb8Dbe02b';                         // local ganche  account0 

const lookVaultInfo = async ()=>{
    const maker = async ()=>{
        Maker.create('http', {
           plugins: [McdPlugin],
           // url: InfuraMain,
           url: HashQuark,
         });
   }

      const manager = maker.service('mcd:cdpManager');
      const proxyAddress = maker.service('proxy').getProxyAddress(ownerAddress);
      const data = await manager.getCdpIds(proxyAddress); // returns list of { id, ilk } objects
      const vault = await manager.getCdp(data[0].id);
      
      console.log([
        vault.collateralAmount, // amount of collateral tokens
        vault.collateralValue,  // value in USD, using current price feed values
        vault.debtValue,        // amount of Dai debt
        vault.collateralizationRatio, // collateralValue / debt
        vault.liquidationPrice  // vault becomes unsafe at this price
      ].map(x => x.toString()))
}

// 开通vault
const createVault = async () =>{
    const maker = await Maker.create('http', {
        plugins: [McdPlugin],
        // url: InfuraMain,
        // url: HashQuark,
        url:LoaclHost, // 本地测试
        privateKey: myPrivateKey
      });

      // verify that the private key was read correctly
      console.log("aa");
    console.log(maker.currentAddress());

    // 确认是否创建了proxy合约
    await maker.service('proxy').ensureProxy();
    const manager = maker.service('mcd:cdpManager');
    console.log(`getManager:${manager.toString}`)

    const vault = await manager.openLockAndDraw(
        'ETH-A', 
        ETH(50), 
        DAI(1000)
      );
      
      console.log(`vault.id:${vault.id}`);
      console.log(`vault.debtValue:${vault.debtValue}`); // '1000.00 DAI'
}

createVault().catch((err) => {
    console.error('ERROR:', err);
});