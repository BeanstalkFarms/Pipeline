/*
 SPDX-License-Identifier: MIT
*/

pragma solidity ^0.8.14;

import "@openzeppelin/contracts-8/token/ERC20/IERC20.sol";
import "../libraries/LibMulDiv.sol";

/**
 * @title Math
 * @author Publius
 **/
contract Math {

    function sub(uint256 a, uint256 b) external pure returns (uint256) {
        return a - b;
    }

    function add(uint256 a, uint256 b) external pure returns (uint256){
        return a + b;
    }

    function div(uint256 a, uint256 b) external pure returns (uint256) {
        return a / b;
    }

    function mul(uint256 a, uint256 b) external pure returns (uint256) {
        return a * b;
    }

    function mulDiv(uint256 a, uint256 b, uint256 denominator) external pure returns (uint256) {
        return LibMulDiv.mulDiv(a, b, denominator);
    }

    function getReceivedTokens(IERC20 token, address account, uint256 balanceBefore) external view returns (uint256) {
        return token.balanceOf(account) - balanceBefore;
    }

    function getSpentTokens(IERC20 token, address account, uint256 balanceBefore) external view returns (uint256) {
        return balanceBefore - token.balanceOf(account);
    }

}