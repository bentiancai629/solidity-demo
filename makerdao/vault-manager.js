const mgr = maker.service('mcd:cdpManager');
import { ETH, BAT, DAI } from '@makerdao/dai-plugin-mcd';


// 开通vault
const cdpManager = async () =>{
    const proxyAddress = await maker.service('proxy').currentProxy();
    const data = await mgr.getCdpIds(proxyAddress);
    const { id, ilk } = data[0];
    // e.g. id = 5, ilk = 'ETH-A'
    
    const vault = await mgr.getCdp(111);
    
    // 创建新的vault
    const txMgr = maker.service('transactionManager');
    const open = await mgr.open('ETH-A');
    txMgr.listen(open, {
      pending: tx => console.log('tx pending: ' + tx.hash)
    });
    const vault = await open;
    
    
    // 创建vault并抵押
    const vault = await mgr.openLockAndDraw(
        'BAT-A', 
        BAT(1000),
        DAI(100)
      );
}

const managedCDP = async () =>{
    const service = maker.service('mcd:cdpType');
    vault.reset();
    await vault.prefetch();
    // await vault.lockAndDraw(ETH(2), DAI(20));
}

const collateralTypes = async () =>{
    service.cdpTypes.forEach(type => console.log(type.ilk));
// ETH-A
// BAT-A
// USDC-A

// this will error if more than one type is defined for ETH
const type = service.getCdpType(ETH);

// disambiguate using the ilk name string:
const ethA = service.getCdpType(null, 'ETH-A');
console.log(type.price.toString()); // "9000.01 ETH/USD"


vault.reset();
await vault.prefetch();

// refresh
service.resetAllCdpTypes();
await service.prefetchAllCdpTypes();
}
  

const daiSavingRate = async ()=>{
    const service = maker.service('mcd:savings');
    await service.join(DAI(1000));
    await service.exit(DAI(1000));
    await service.exitAll(DAI(1000));
    await service.balance();
    await service.balanceOf(address);
    await service.getTotalDai();
    await service.getYearlyRate();
}

// 当前单位
const currencyUnits = async ()=>{
    // const maker = await Maker.create(...);
    const mgr = maker.service('mcd:cdpManager');
    
    // lock BAT into a new vault and draw Dai
    const vault = await mgr.openLockAndDraw(
      'BAT-A',
      BAT(100),
      DAI(100)
    );
    
    // Single-Collateral Sai
    const {
      MKR,
      SAI,
      ETH,
      WETH,
      PETH,
      USD_ETH,
      USD_MKR,
      USD_SAI
    } = Maker;
    
    // These are all identical:
    
    // each method has a default type
    cdp.lockEth(0.25);
    cdp.lockEth('0.25');
    
    // you can pass in a currency unit instance
    cdp.lockEth(ETH(0.25));
    
    // currency units have convenient converter methods
    cdp.lockEth(ETH.wei(250000000000000000));
    
    const eth = ETH(5);
    eth.toString() == '5.00 ETH';
    
    const price = USD_ETH(500);
    price.toString() == '500.00 USD/ETH';
    
    // multiplication handles units
    const usd = eth.times(price);
    usd.toString() == '2500.00 USD';
    
    // division does too
    const eth2 = usd.div(eth);
    eth2.isEqual(eth);
}

const systemData = async()=>{
    const service = maker.service('mcd:systemData');

    const base = await service.getAnnualBaseRate();
    const line = await service.getSystemWideDebtCeiling();
    const dead = await service.isGlobalSettlementInvoked();

}


const dsProxy = async ()=>{
    const service = maker.service('proxy');
    /**
     * 
    // Forwarding proxy
    function lockAndDraw(address tub_, bytes32 cup, uint wad) public payable {
    lock(tub_, cup);
    draw(tub_, cup, wad);}
     * 
     */

     // Calling the forwarding proxy with dai.js

    await function lockAndDraw(tubContractAddress, cdpId, daiAmount, ethAmount) {
    const saiProxy = maker.service('smartContract').getContractByName('SAI_PROXY');
    return saiProxy.lockAndDraw(
      tubContractAddress,
      cdpId,
      daiAmount,
      {
        value: ethAmount,
        dsProxy: true
      }
    );
  }
}


collateralTypes()