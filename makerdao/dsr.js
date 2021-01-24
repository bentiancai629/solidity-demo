var Web3 = require('web3');
console.log(Web3.version);
//设置web3对象
var web3 = new Web3('https://mainnet.infura.io/v3/74ce7b1c7a104effb6ab0b86ff09eaf0');//以太坊正式网络节点地址
// var web3 = new Web3('http://152.32.252.15:11122');//以太坊正式网络节点地址

//获取当前区块高度
function getBlockNumber () {
     web3.eth.getBlockNumber().then(
    function(result){
        console.log("blockNumber:" + result);
    })
}

var txh = '0xd89490684798d3ea537ee3378ad3e12fb05feff9ab1ee0f91b39318797ade117'

//获取交易信息
async function getTransactions (txh) {
    const result = await web3.eth.getTransaction(txh)
    console.log("result:",result)
}

// 获取地址余额
function getBalance () {
    const currentAccount = '0xe36f73F4AA10332bdae490C6B04F7960FfaB2172'
    web3.eth.getBalance(currentAccount).then(console.log);
}

// getTransactions(txh)
getBlockNumber()
// getBalance()
// getBalance()
