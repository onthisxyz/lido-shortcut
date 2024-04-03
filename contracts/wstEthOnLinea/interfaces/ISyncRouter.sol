// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

interface ISyncRouter {
    struct TokenAmount {
        address token;
        uint amount;
    }

     struct TokenInput {
        address token;
        uint amount;
    }

     struct SwapStep {
        address pool;
        bytes data;
        address callback;
        bytes callbackData;
    }

    struct SwapPath {
        SwapStep[] steps;
        address tokenIn;
        uint amountIn;
    }

    function swap(
        SwapPath[] memory paths,
        uint amountOutMin,
        uint deadline
    ) external payable returns (TokenAmount memory amountOut);

}
