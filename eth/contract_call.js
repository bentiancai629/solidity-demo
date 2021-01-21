const fs = require('fs');
const Web3 = require("web3");
const solc = require('solc');

const data = fs.readFileSync('./MetaCoin.sol');
// console.log(data.toString())

const web3 = new Web3();

// Ganache默认端口7545
web3.setProvider(new Web3.providers.HttpProvider("http://localhost:8545"));

// 1 是优化器参数
const output = solc.compile(data.toString(), 1);
// console.log(output)

const bytecode = output.contracts[':MetaCoin'].bytecode;
const abi = output.contracts[':MetaCoin'].interface;


const CONTRACT_ADDRESS = '0xAf53d242140DB8Be5445531f9b95562CD522554F'
const CREATE_ADDRESS = '0x5b387cAa283a78698b829aDA38406dBC2B25860B'
const FROM_ADDRESS = '0x5b387cAa283a78698b829aDA38406dBC2B25860B'
const TO_ADDRESS = '0xc910b266fD13f5Fe5C634A504eFaAbe79005c8b8'

// 相对于部署合约，多了第二个参数，即合约地址
const metaCoinContract = new web3.eth.Contract(JSON.parse(abi), CONTRACT_ADDRESS, {
    // 非必填，合约的bytecode
    data: bytecode,
    // 非必填，合约的创建者
    from: CREATE_ADDRESS,
    //Gas limit
    gas: 4712388,
    gasPrice: '1000000'
});


// 调用合约中的sendCoin方法
metaCoinContract.methods.sendCoin(TO_ADDRESS, 5).send({
    //非必填，该合约方法的调用者
    from: CREATE_ADDRESS
}).on('transactionHash', function (hash) {
    console.log(`hash: ${hash}`)
}).on('receipt', function (receipt) {
    // console.log(receipt)
}).on('confirmation', function (confirmationNumber, receipt) {
    // console.log(confirmationNumber)
}).on('error', console.error)


// 调用合约中的getBalance方法
metaCoinContract.methods.getBalance(TO_ADDRESS).call({
    //非必填，该合约方法的调用者
    from: CREATE_ADDRESS
}, function (error, result) {
    console.log('error:' + error)
    console.log('result:' + result.events.Transfer.returnValues[0])
})