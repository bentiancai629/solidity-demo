const { Token } = require('@uniswap/sdk')
const UNISWAP = require('@uniswap/sdk')

const chainId = ChainId.MAINNET
const tokenAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F' // must be checksummed
const decimals = 18
const DAI = new Token(chainId, tokenAddress, decimals)

function pay(uint paymentAmountInDai) public payable {
    if (msg.value > 0) {
        convertEthToDai(paymentAmountInDai);
    } else {
        require(daiToken.transferFrom(msg.sender, address(this), paymentAmountInDai);
    }
    // do something with that DAI
    
}