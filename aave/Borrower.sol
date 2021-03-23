/**
    youtube: https://www.youtube.com/watch?v=03jO9vbrXvY&list=PLbbtODcOYIoEMz-XatfkcFMsEwMmYShwk
 */

pragma solidity ^0.5.0;

import 'https://github.com/aave/protocol-v2/blob/master/contracts/protocol/configuration/LendingPoolAddressesProvider.sol';
import 'https://github.com/aave/protocol-v2/blob/master/contracts/protocol/lendingpool/LendingPool.sol';
import 'https://github.com/aave/protocol-v2/blob/master/contracts/flashloan/base/FlashLoanReceiverBase.sol';

 contract Borrower {
     lendingPoolAddressesProvider provider;
     address dai;

     constructor(
         address _provider, 
         address _dai) 
         FlashLoanReceiverBase(_provider)
         public {
         provider = lendingPoolAddressesProvider(_provider);
         dai = _dai;
     }
     
     function startLoan(unit amount, bytes calldata _params) external {
         LendingPool lendingPool = provider.getLendingPool();
         lendingPool.flashLoad(address(this), dai,admout, _params);
     }
     
     function executeOperation(
         address _reserve,
         uint _amount,
         uint _fee,
         bytes memory _params
         ) external {
             // arbitrage, refinance loan,
             transferFundsBackToPoolInternal(_reserve, amount + fee);
         }
         
 }