//初始化过程
var Web3 = require('web3');
if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
    // set the provider you want from Web3.providers
  web3 = new Web3(new Web3.providers.HttpProvider("https://goerli.infura.io/v3/74ce7b1c7a104effb6ab0b86ff09eaf0"));
} 

 //省略初始化过程
 var info = web3.eth.getBlock(3150);
 console.log(info);

 var blockNumber = 668;
 var indexOfTransaction = 0
 
 var transaction = web3.eth.getTransaction(blockNumber, indexOfTransaction);
 console.log(transaction);