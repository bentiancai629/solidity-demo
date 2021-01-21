const Maker = require('@makerdao/dai');
const { McdPlugin } = require('@makerdao/dai-plugin-mcd');


const main = async () => {
    // you provide these values
    const infuraKey = '74ce7b1c7a104effb6ab0b86ff09eaf0';
    const ownerAddress = '0x2acA78D05Bc5d3D040ed38fA4A0EC1878e45107A';

    const maker = await Maker.create('http', {
        plugins: [McdPlugin],
        url: `https://mainnet.infura.io/v3/${infuraKey}`
    });

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
    ].map(x => x.toString()));
}

main().catch((err) => {
    console.error('ERROR:', err);
});