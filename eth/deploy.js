const fs = require('fs');
const Web3 = require("web3");
const solc = require('solc');

const data = fs.readFileSync('./MetaCoin.sol');
// console.log(data.toString())

const web3 = new Web3();

// Ganache默认端口7545
web3.setProvider(new Web3.providers.HttpProvider("http://localhost:8545"));

// // 1 是优化器参数
const output = solc.compile(data.toString(),1);
// console.log(output)

const bytecode = output.contracts[':MetaCoin'].bytecode;
const abi = output.contracts[':MetaCoin'].interface;

const GANACHE_ACCOUNT1 = '0x5b387cAa283a78698b829aDA38406dBC2B25860B'

// 第一个参数：合约的abi对象
new web3.eth.Contract(JSON.parse(abi), {
    // 必填，合约发起者
    from: GANACHE_ACCOUNT1,
    // 合约bytecode，也可也在deploy中传入
    data: bytecode,
    // 即gas limit，该交易最大可使用的Gas
    gas: 500000,
    gasPrice: '1000000'
}).deploy().send().then((instance) => {
    console.log(`instance: `,instance)

//     // 合约地址
    console.log(`Address: ${instance.options.address}`);

//     //执行合约，只是查询状态，不需要挖矿，所以调用call方法
    instance.methods.getBalance(GANACHE_ACCOUNT1).call({
        //非必填，该合约方法的调用者
        from: GANACHE_ACCOUNT1
    }, function (error, result) {
        console.log('error:' + error)
        console.log('result:' + result)
    })
})