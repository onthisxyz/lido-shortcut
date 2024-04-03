// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./interfaces/IAcross.sol";

// https://onthis.xyz
/*
 .d88b.  d8b   db d888888b db   db d888888b .d8888. 
.8P  Y8. 888o  88    88    88   88    88    88   YP 
88    88 88V8o 88    88    88ooo88    88     8bo.   
88    88 88 V8o88    88    88   88    88       Y8b. 
`8b  d8' 88  V888    88    88   88    88    db   8D 
 `Y88P'  VP   V8P    YP    YP   YP Y888888P  8888Y  
*/

contract SwapToWstEthOnLinea is OwnableUpgradeable {
    uint256 public constant CHAIN_ID = 59144;
    address public constant BRIDGE = 0x5c7BCd6E7De5423a257D81B442095A1a6ced35C5;
    address public constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address constant FEE_DESTINATION =
        0x857eFc6c1280778b20B14af709C857E8164E731D;
    uint256 constant COMPLEXITY = 2;
    uint256 constant BASE_FEE = 1000;

    uint256 public decimal1;
    uint256 public decimal2;
    uint256 public percent1;
    uint256 public percent2;
    address public l2Recepient;
    uint256[50] private _gap;

    function initialize(address _l2Recepient) public initializer {
        __Ownable_init();
        decimal1 = 16;
        decimal2 = 15;
        percent1 = 5;
        percent2 = 2;
        l2Recepient = _l2Recepient;
    }

    function withdrawTokens(
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

    function setL2Recepient(address _l2Recepient) external onlyOwner {
        l2Recepient = _l2Recepient;
    }

    function changeConfig(
        uint256 newDec1,
        uint256 newDec2,
        uint256 newPercent1,
        uint256 newPercent2
    ) public onlyOwner {
        decimal1 = newDec1;
        decimal2 = newDec2;
        percent1 = newPercent1;
        percent2 = newPercent2;
    }

    function getHighRelayersFee(uint256 val) public view returns (int64) {
        return
            val <= 0.1 ether
                ? int64(int256((percent1 * 10 ** decimal1)))
                : int64(int256((percent2 * 10 ** decimal2)));
    }

    function _chargeFee(uint256 amount) private returns (uint256) {
        uint256 fee = (amount * COMPLEXITY) / BASE_FEE;

        payable(FEE_DESTINATION).transfer(fee);
        return fee;
    }

    receive() external payable {
        require(msg.value >= 0.01 ether, "Bridging value too low");
        // project fees
        uint256 chargedFees = _chargeFee(msg.value);
        uint256 valueAfterFees = msg.value - chargedFees;
        // across relayers fees
        int64 relayerFeePct = getHighRelayersFee(valueAfterFees);
        // encoding original msg.sender
        bytes memory message = abi.encode(msg.sender);

        IAcross(BRIDGE).deposit{value: valueAfterFees}(
            l2Recepient,
            WETH,
            valueAfterFees,
            CHAIN_ID,
            relayerFeePct,
            uint32(block.timestamp),
            message,
            type(uint256).max
        );
    }
}
