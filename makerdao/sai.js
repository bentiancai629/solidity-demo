const { ScdPlugin } = require('@makerdao/dai-plugin-scd');
const Maker = require('@makerdao/dai')
// const ScdPlugin = require('@makerdao/dai-plugin-scd')
// import Maker from '@makerdao/dai';
// import { ScdPlugin } from '@makerdao/dai-plugin-scd';

const YOUR_PRIVATE_KEY = 'cd385d59e3086a0e3eeedfbd97ca42e83656a87edc488c49c1e3a75bdb056102'

async function openLockDraw() {
  const maker = await Maker.create("http", {
    plugins: [ScdPlugin],
    privateKey: YOUR_PRIVATE_KEY,
    url: 'https://kovan.infura.io/v3/74ce7b1c7a104effb6ab0b86ff09eaf0'
  });

  await maker.authenticate();
  const cdpService = await maker.service('cdp');
  const cdp = await cdpService.openCdp();

  await cdp.lockEth(0.25);
  await cdp.drawSai(50);

  const debt = await cdp.getDebtValue();
  console.log(debt.toString); // '50.00 SAI'
}

openLockDraw();