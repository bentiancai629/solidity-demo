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

    const ADDR1 = '15BQUqtqhmqJPyvvEH5GYyWffXWKuAgoSUHuG1UeNdb8oDNT'; // hashquark
    const ADDR2 = '1REAJ1k691g5Eqqg9gL7vvZCBG7FCCZ8zgQkZWd4va5ESih' // polkadot pro
    console.log("================= Runtime constants ===============================");

    // 多条查询 Subscribe to balance changes for 2 accounts, ADDR1 & ADDR2 (already defined)
    const unsub1 = await api.query.system.account.multi([ADDR1, ADDR2], (balances) => {
        const [{ data: balance1 }, { data: balance2 }] = balances;

        console.log(`The balances are ${balance1.free} and ${balance2.free}`);
    });


    // 检索验证人快照
    // const validatorKeys = await api.query.session.validators.keys();  // is not a function

    // Subscribe to the balances for these accounts
    const unsub2 = await api.query.balances.account.multi(validators, (balances) => {
        console.log(`The nonce and free balances are: ${balances.map(([nonce, { free }]) => [nonce, free])}`);
    });

    // Subscribe to the timestamp, our index and balance
    const unsub3 = await api.queryMulti([
        api.query.timestamp.now,
        [api.query.system.account, ADDR]
    ], ([now, { nonce, data: balance }]) => {
        console.log(`${now}: balance of ${balance.free} and a nonce of ${nonce}`);
    });

    console.log("================= OVER ===============================");
}

main().catch((error) => {
    console.error(error);
    process.exit(-1);
});