// SPDX-License-Identifier: MIT

pragma solidity 0.7.5;

 contract NFTHolders{
  mapping(address => uint) public balances;
  
  constructor( address[] memory holders, uint[] memory balance)  {
      balances[holders[0]]=balance[0]; 
      balances[holders[1]]=balance[1]; 
     // balances[holders[2]]=balance[2]; 
  }
  
  function balanceOf(address payable _address) public view returns(uint) {
        return balances[_address];
    }
}