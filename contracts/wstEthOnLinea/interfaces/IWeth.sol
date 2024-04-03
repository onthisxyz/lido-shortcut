// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;


interface IWeth {
    function balanceOf(address addr) external returns(uint256);
    function deposit() external payable;
    function approve(address guy, uint wad) external returns (bool);
    function withdraw(uint256 amount) external;
    function transfer(address dst, uint wad) external returns (bool);
}