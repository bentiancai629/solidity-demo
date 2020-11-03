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

    const ADDR = '15BQUqtqhmqJPyvvEH5GYyWffXWKuAgoSUHuG1UeNdb8oDNT'; // hashquark

    console.log("================= Query extras ===============================");

    // Retrieve the current block header
    const lastHdr = await api.rpc.chain.getHeader();
    console.log(`lastHdr: ${lastHdr}`)
    // Retrieve the balance at both the current and the parent hashes
    const [{ data: balanceNow }, { data: balancePrev }] = await Promise.all([
        api.query.system.account.at(lastHdr.hash, ADDR),
        api.query.system.account.at(lastHdr.parentHash, ADDR)
    ]);

    // Display the difference
    console.log(`The delta was ${balanceNow.free.sub(balancePrev.free)}`);

    // 检索时间戳
    const momentPrev = await api.query.timestamp.now.at(lastHdr.parentHash);
    console.log(`momentPrev:${momentPrev}`)

    // Retrieve the current block header
    // const lastHdr = await api.rpc.chain.getHeader();
    const startHdr = await api.rpc.chain.getBlockHash(lastHdr.number.unwrap().subn(500));

    // retrieve the range of changes
    // const changes = await api.query.system.account.range([startHdr]);

    // changes.forEach(([hash, value]) => {
    //     console.log(hash.toHex(), value.toHuman());
    // });

    // Map keys & entries#
    // 检索激活的era
    const activeEra = await api.query.staking.activeEra();
    console.log(`activeEra:${activeEra}`)
    // retrieve all exposures for the active era
    // const exposures = await api.query.staking.erasStakers.entries(activeEra.index);
    // console.log(`exposures:${exposures}`)
    // exposures.forEach(([key, exposure]) => {
    //     console.log('key arguments:', key.args.map((k) => k.toHuman()));
    //     console.log('     exposure:', exposure.toHuman());
    // });

    // retrieve all the nominator keys
    const keys = await api.query.staking.nominators.keys();
    console.log(`keys: ${keys.length}`)
    // extract the first key argument [AccountId] as string
    // const nominatorIds = keys.map(({ args: [nominatorId] }) => nominatorId);

    // console.log('all nominators:', nominatorIds.join(', '));

    // Retrieve the hash & size of the entry as stored on-chain
    const [entryHash, entrySize] = await Promise.all([
        api.query.system.account.hash(ADDR),
        api.query.system.account.size(ADDR)
    ]);

    // Output the info
    console.log(`The current size is ${entrySize} bytes with a hash of ${entryHash}`);

    // Extract the info
    const { meta, method, section } = api.query.system.account;

    // Display some info on a specific entry
    console.log(`${section}.${method}: ${meta.documentation.join(' ')}`);
    console.log(`query key: ${api.query.system.account.key(ADDR)}`);
    console.log("================= OVER ===============================");
}

main().catch((error) => {
    console.error(error);
    process.exit(-1);
});