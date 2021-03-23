//初始化过程
var Web3 = require('web3');
var address = ""

if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
    // set the provider you want from Web3.providers
  web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
} 

const a = async () => {
    const balance = await web3.eth.getBalance()
    console.log(balance)

}

const main = async () => {
 await a()
}

main()