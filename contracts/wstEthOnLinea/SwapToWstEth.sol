pragma solidity ^0.8.9;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/ISyncRouter.sol";
import "./interfaces/IWeth.sol";

// https://onthis.xyz
/*
 .d88b.  d8b   db d888888b db   db d888888b .d8888. 
.8P  Y8. 888o  88    88    88   88    88    88   YP 
88    88 88V8o 88    88    88ooo88    88     8bo.   
88    88 88 V8o88    88    88   88    88       Y8b. 
`8b  d8' 88  V888    88    88   88    88    db   8D 
 `Y88P'  VP   V8P    YP    YP   YP Y888888P  8888Y  
*/

contract SwapToWstEth is OwnableUpgradeable {
    address public constant syncSwapRouter =
        0x80e38291e06339d10AAB483C65695D004dBD5C69;
    address public constant pool = 0xd236b61B6445F2aF7775814Aa690BeC421ce3DD6;
    address public constant weth = 0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f;
    uint256 public nativeLeftover;

    uint256[50] private _gap;

    function initialize() public initializer {
        __Ownable_init();
        nativeLeftover = 0.005 ether;
    }

    // handleV3AcrossMessage will be called by accross relayer
    function handleV3AcrossMessage(
        address token,
        uint256 amount,
        address,
        bytes memory message
    ) external {
        require(token == weth, "Unexpeted token");
        // decoding original msg.sender
        address maker = abi.decode(message, (address));
        // preparing args for swap
        bytes memory swapData = abi.encode(weth, maker, 2);

        uint256 valueToSwap = amount - nativeLeftover;

        ISyncRouter.SwapStep[] memory step = new ISyncRouter.SwapStep[](1);
        step[0] = ISyncRouter.SwapStep(
            pool,
            swapData,
            address(0),
            new bytes(0)
        );

        ISyncRouter.SwapPath[] memory path = new ISyncRouter.SwapPath[](1);
        path[0] = ISyncRouter.SwapPath(step, weth, valueToSwap);

        IWeth(weth).approve(syncSwapRouter, valueToSwap);
        // since theirs no ability of calculating slippage onchain and linea doesn't have public mempool we can set amountOutMin to 0
        ISyncRouter(syncSwapRouter).swap(path, 0, block.timestamp);

        uint256 balanceBefore = address(this).balance;
        IWeth(weth).withdraw(nativeLeftover);
        uint256 balanceAfter = address(this).balance;

        // sending 0.005 native eth
        payable(maker).transfer(balanceAfter - balanceBefore);        
    }

    function setNativeLeftover(uint256 _nativeLeftover) external onlyOwner {
        nativeLeftover = _nativeLeftover;
    }

    function rescueFunds(
        address token,
        address to,
        uint256 amount
    ) external onlyOwner {
        if (token == address(0)) {
            payable(to).transfer(amount);
        } else {
            IERC20(token).transfer(to, amount);
        }
    }

    receive() external payable {
        // preventing user from accidentally sending eth
        require(msg.sender == weth, "!Weth");
    }
}
