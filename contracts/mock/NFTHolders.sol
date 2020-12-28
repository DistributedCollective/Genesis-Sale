// SPDX-License-Identifier: MIT

pragma solidity 0.7.5;

import "../openzeppelin/SafeMath.sol";
//import "./SafeMath.sol";

 contract NFTHolders{
     using SafeMath for uint256;
  
  mapping(address => address) internal HolderTopNFT;
    /**
    * @dev extract HolderTopNFT mapping (holder address => top NFTrank address)
    * @dev all the extraction (high gas) is done in the constructor
    * Inputs (all addresses):
    * holders      [] - array of all holders addresses
    * NFTAddresses [] - array of 5 NFT's addresses
    * NFT0Holders  [] - all addresses that hold NFT0 (highest NFT Rank)
    * NFT1Holders  [] - all addresses that hold NFT1 
    * NFT2Holders  [] - all addresses that hold NFT2 
    * NFT3Holders  [] - all addresses that hold NFT3 
    * NFT4Holders  [] - all addresses that hold NFT4 (lowest NFT Rank)
    **/
  constructor(
      address[] memory holders,        // All NFT holders addresses 
      address[] memory NFTAddresses,   // All 5 NFT's addresses
      address[] memory NFT0Holders,    // All Holders of NFT0
      address[] memory NFT1Holders,    // All Holders of NFT1
      address[] memory NFT2Holders,    // All Holders of NFT2
      address[] memory NFT3Holders,    // All Holders of NFT3
      address[] memory NFT4Holders )    // All Holders of NFT4 
      {
      for( uint256 i = 0 ; i < holders.length ; i=i.add(1)) {
          for( uint256 j = 0 ; j < NFT0Holders.length ; j=j.add(1)) {
           if (holders[i] == NFT0Holders[j]) {
               HolderTopNFT[holders[i]]= NFTAddresses[0];
               break;
           }}
           if (HolderTopNFT[holders[i]] != address(0x0) ){
               continue;
           }
          for( uint256 j = 0 ; j < NFT1Holders.length ; j=j.add(1)) {
           if (holders[i] == NFT1Holders[j]) {
               HolderTopNFT[holders[i]]= NFTAddresses[1];
               break;
           }}
           if (HolderTopNFT[holders[i]] != address(0x0) ){
               continue;
           }
           for( uint256 j = 0 ; j < NFT2Holders.length ; j=j.add(1)) {
           if (holders[i] == NFT2Holders[j]) {
               HolderTopNFT[holders[i]]= NFTAddresses[2];
               break;
           }}
           if (HolderTopNFT[holders[i]] != address(0x0) ){
               continue;
           }
           for( uint256 j = 0 ; j < NFT3Holders.length ; j=j.add(1)) {
           if (holders[i] == NFT3Holders[j]) {
               HolderTopNFT[holders[i]]= NFTAddresses[3];
               break;
           }}
           if (HolderTopNFT[holders[i]] != address(0x0) ){
               continue;
           }
           for( uint256 j = 0 ; j < NFT4Holders.length ; j=j.add(1)) {
           if (holders[i] == NFT4Holders[j]) {
               HolderTopNFT[holders[i]]= NFTAddresses[4];
               break;
           }}
           if (HolderTopNFT[holders[i]] != address(0x0) ){
               continue;
           }
           }
      }
     
  function HolderNFT(address payable _address) internal view returns(address) {
        return HolderTopNFT[_address];
    }
}