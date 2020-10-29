//初始化过程
var Web3 = require('web3');
var BigNumber = require('bignumber.js');
const {Base64} = require('js-base64');
const { hexToString } = require('web3-utils');
var URLSafeBase64 = require('urlsafe-base64');
const base64url = require('base64url');

if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
    // set the provider you want from Web3.providers
  web3 = new Web3(new Web3.providers.HttpProvider("https://goerli.infura.io/v3/74ce7b1c7a104effb6ab0b86ff09eaf0"));
} 

 //省略初始化过程
//  var info = web3.eth.getBlock(3150);
//  console.log(info);
 
// web3.eth.getBlock(3150,function(error,result){

// })

//  var blockNumber = 668;
//  var indexOfTransaction = 0
 
//  var transaction = web3.eth.getTransaction(blockNumber, indexOfTransaction);
//  console.log(transaction);

//  web3.eth.getBlock(48, function(error, result) {
// 	if (!error)
// 		console.log(JSON.stringify(result));
// 	else
// 		console.error(error);
// });


// var str = "j88oiWqF5edu6eUIQ44j5yU9oaI6ZQHjp9VhglINvPTNtErzJnMYGI8fQWg0IUba"
// var hstr = web3.toHex(str);
// console.log(hstr)


/**
 * hex to base64
 */
var hex = '0040597307000000'
var btoa = require('btoa');
function hexToBase64(hexStr) {
	return btoa([...hexStr].reduce((acc, _, i) =>
	  acc += !(i - 1 & 1) ? String.fromCharCode(parseInt(hexStr.substring(i - 1, i + 1), 16)) : "" 
	,""));
  }
var hexStr = hexToBase64(hex)
// const base64Str = Buffer.from(hexString, 'hex').toString('base64');
// console.log("base64String:",hexStr)

/**
 * 16进制字符串转10进制
 * returnValues: Result {
    pubkey: '0xb26ad4bee55b96575f32a913f638ca8795d306cd391b841d47ce2292ce5281b27eb1d617d36a934fae73f2e6cda8aa62',
    withdrawal_credentials: '0x003373a1c7e0e25fb7257bd681503f06c6c9a741d96fb26886d98c79525c5386',
    amount: '0x0040597307000000',
    signature: '0x8ea7fdd60cee7692640f0a5ac85f0f8c05a6fe2d2adee419d725fe954ac3c3efaef1b2faf100a3f867f588e893d0f9c2044494b11280965a459adfbb7493f0710e00b328092e3ae710ffb4a0dedeafbc9aa2e628cab8a5751aebfffc1b6df10b',
    index: '0x4780000000000000'
  },
 */

//  var hexStr = '0x4780000000000000'
//  var res = parseInt(hexStr,10)
//  console.log(res)




 /**
  * lEASTER hexStr => 10进制int
  * 
  * pubkey: '0xa29706c9187036f8892d2d526e0164535c71295690c13b5844bae13314ce45d281b08a09c16d7b5b26b47d0336c1f6f1',
    withdrawal_credentials: '0x0041f267d19a9873d73f7da733105201e818bc94b6eba009a85c932e31b9c5a3',
    amount: '0x0040597307000000',  // 32
    signature: '0xac3b9287a5dbde02a2064a4de9fe1b2be113caa399df5989b7e4cde8159ba8cd9b127ae79c56cf2efa67da08a39835e90cbefad61419375339ed2d122b885d5ff7735f46dbfb2fe0aeca5e30d8f1dde2c83282c63f0cd8d91ec3e786023961ef',
    index: '0x1846010000000000'  // 81056
  */
var count = "0xa29706c9187036f8892d2d526e0164535c71295690c13b5844bae13314ce45d281b08a09c16d7b5b26b47d0336c1f6f1"
 var littleEndianString = count.toString().substring(2);
//  console.log("littleEndianString: " + littleEndianString);
 var len = littleEndianString.length;
 var bigEndianHexString = "0x";
 for(var i = 0; i < len/2; i++)
 {
     bigEndianHexString += littleEndianString.substring((len-((i+1)*2)),(len-(i*2)));
 }
// console.log("count: " + parseInt(bigEndianHexString, 16));



let pk = "0x806b18e42fc650342f7298c79f06e3d21cdb4dc23b9d52e00ed9dac76773ffe05b62201df542af1bfbab27d96fe7d049"
var publickKeyHex = pk.substr(2)
// console.log("publicKeyBase: ", publickKeyHex)
let validatorPublicKey64  = btoa([...publickKeyHex].reduce((acc, _, i) => acc += !(i - 1 & 1) ? String.fromCharCode(parseInt(publickKeyHex.substring(i - 1, i + 1), 16)) : "" ,""))

// gGsY5C/GUDQvcpjHnwbj0hzbTcI7nVLgDtnax2dz / + BbYiAd9UKvG / urJ9lv59BJ
// gGsY5C%2FGUDQvcpjHnwbj0hzbTcI7nVLgDtnax2dz%2F%2BBbYiAd9UKvG%2FurJ9lv59BJ
// console.log("publicKeyBase64: ",validatorPublicKey64)
let urlBase64= URLSafeBase64.encode(pk)
// console.log("Base64: ", validatorPublicKey64)
// console.log("urlBase64: ", urlBase64)

//由于加密后的值含有特殊字符,不能直接有做为url在网络中传输,故需要将其转换(这里需要我用的是:urlsafe-base64 npm)
//编码后的值可以放入url中,在服务器用邮件发出去
var randomURLSafeBase64 = URLSafeBase64.encode(Buffer.from(pk,'base64'));//需要先安装:npm urlsafe-base64
var randomURLSafeBase64 = URLSafeBase64.encode(Buffer.from(validatorPublicKey64,'base64'));
// console.log("randomURLSafeBase64:",randomURLSafeBase64)


let base64urlResult = base64url(publickKeyHex)
console.log("base64urlResult: ", base64urlResult)

var base64String = Buffer.from(publickKeyHex, 'hex').toString('base64')
console.log(base64String)
