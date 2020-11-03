require("dotenv").config();
require("console-stamp")(console, { pattern: "yyyy-mm-dd HH:MM:ss.l" });
const { ApiPromise, WsProvider } = require("@polkadot/api");
const { encodeAddress } = require("@polkadot/util-crypto");
const { formatBalance } = require("@polkadot/util");
const BN = require("bn.js");
const UTIL = require("../../polkadot-monitor/app/utils/util");


async function main() {

    const provider = new WsProvider(`wss://rpc.polkadot.io`)
    const api = await ApiPromise.create({ provider })
    provider.on("disconnected", () => {
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

    console.log("================= 业务方法 ===============================");

    const overview = await api.derive.staking.overview();
    // 纪元分 需要遍历？
    console.log("----当前纪元:" + JSON.stringify(overview.currentEra));

    // 所有纪元历史
    const allPoints = await api.derive.staking.stakerPoints("15BQUqtqhmqJPyvvEH5GYyWffXWKuAgoSUHuG1UeNdb8oDNT");
    console.log("----所有纪元记录:" + JSON.stringify(allPoints.length));

    // 验证人数量
    // console.log("----验证人数量:" + JSON.stringify(overview.validatorCount));

    // 当前纪元分
    const currentPoints = await api.derive.staking.currentPoints()
    const individualObj = JSON.stringify(currentPoints.individual)
    // console.log("----individualObj: ", individualObj)
    // console.log("----账户纪元分:" + JSON.stringify(currentPoints))
    console.log("----纪元分均值: ", currentPoints.total / Object.keys(JSON.parse(individualObj)).length)

    const hashquark = "15BQUqtqhmqJPyvvEH5GYyWffXWKuAgoSUHuG1UeNdb8oDNT"

    for (let e of currentPoints.individual) {
        console.log(`${JSON.stringify(e[0])}'s point: ${JSON.stringify(e[1])}`)
        if (JSON.stringify(e[0]) === JSON.stringify(hashquark)) {
            console.log(`hashquark: ${hashquark}'s point: ${e[1]} in era: ${JSON.stringify(overview.currentEra)}`)
            break
        }
    }

    console.log("================= OVER ===============================");
}

main().catch((error) => {
    console.error(error);
process.exit(-1);
});