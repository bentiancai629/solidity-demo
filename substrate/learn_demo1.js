require("dotenv").config();
require("console-stamp")(console, { pattern: "yyyy-mm-dd HH:MM:ss.l" });
const { ApiPromise, WsProvider } = require("@polkadot/api");
const { encodeAddress } = require("@polkadot/util-crypto");
const { formatBalance } = require("@polkadot/util");


async function main() {

    const wsProvider = new WsProvider(`wss://rpc.polkadot.io`)
    const api = await ApiPromise.create({ provider: wsProvider })
    wsProvider.on("disconnected", () => {
        console.error(`Substrate websocket has been disconnected from the endpoint ${wsEndpoint}`);
        process.exit(-1);
    });

    let chainInfo = {};
    [chainInfo.chain, chainInfo.nodeName, chainInfo.nodeVersion, chainInfo.properties] = await Promise.all([
        api.rpc.system.chain(),
        api.rpc.system.name(),
        api.rpc.system.version(),
        api.rpc.system.properties(),
    ]);

    console.log("tokenDecimals:", JSON.stringify(chainInfo.properties.tokenDecimals))
    console.log("tokenSymbol", JSON.stringify(chainInfo.properties.tokenSymbol))

    // 格式化decimal和symbol
    formatBalance.setDefaults({
        decimals: chainInfo.properties.tokenDecimals,
        unit: chainInfo.properties.tokenSymbol,
    });

    const formatAddress = (address) => (address ? encodeAddress(address, chainInfo.properties.ss58Format) : "");
    const getNickName = async (accountId) => {
        const accountInfo = await api.derive.accounts.info(accountId);
        return accountInfo.identity;
    };

    console.log("================= Runtime constants ===============================");

    // The length of an epoch (session) in Babe
    console.log(api.consts.babe.epochDuration.toNumber());

    // The amount required to create a new account
    // console.log(api.consts.balances.creationFee.toNumber()); // undefined

    // The amount required per byte on an extrinsic
    // console.log(api.consts.balances.transactionByteFee.toNumber());  // undefined

    /* Basic queries */
    // The actual address that we will use
    const ADDR = '15BQUqtqhmqJPyvvEH5GYyWffXWKuAgoSUHuG1UeNdb8oDNT'; // hashquark

    // Retrieve the last timestamp
    // const now = await api.query.timestamp.now();

    // Retrieve the account balance & nonce via the system module 查询地址信息
    // const { nonce, data: balance } = await api.query.system.account(ADDR);
    // console.log(`时间: ${now}: 余额 ${balance.free} and  nonce值 ${nonce}`);

    // 解构 同时获取
    // Retrieve last block timestamp, account nonce & balances
    const [now, { nonce, data: balances }] = await Promise.all([
        api.query.timestamp.now(),
        api.query.system.account(ADDR)
    ]);
    console.log(`时间: ${now}: 余额 ${balances.free} and  nonce值 ${nonce}`);

    // Retrieve the chain name
    const chain = await api.rpc.system.chain();
    // Retrieve the latest header
    const lastHeader = await api.rpc.chain.getHeader();

    console.log(`${chain}: last block #${lastHeader.number} has hash ${lastHeader.hash}`);

    // 监听 Subscribe to the new headers
    await api.rpc.chain.subscribeNewHeads((lastHeader) => {
        console.log(`${chain}: last block #${lastHeader.number} has hash ${lastHeader.hash}`);
    });

    // 监听10个区块
    let count = 0;

    // Subscribe to the new headers
    const unsubHeads = await api.rpc.chain.subscribeNewHeads((lastHeader) => {
        console.log(`${chain}: last block #${lastHeader.number} has hash ${lastHeader.hash}`);
        if (++count === 10) {
            unsubHeads();
        }
    });

    // Detour into derives
    const unsub = await api.derive.chain.subscribeNewHeads((lastHeader) => {
        console.log(`#${lastHeader.number} was authored by ${lastHeader.author}`);
    });
    console.log("================= OVER ===============================");
}

main().catch((error) => {
    console.error(error);
    process.exit(-1);
});