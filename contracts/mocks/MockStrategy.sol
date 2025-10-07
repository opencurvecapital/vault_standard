// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @notice Minimal mock strategy for testing Vault integration
contract MockStrategy {
    address public want;       // underlying token
    address public controller; // vault or controller managing it
    uint256 private _balance;  // internal accounting

    constructor(address _want, address _controller) {
        want = _want;
        controller = _controller;
    }

    function deposit() external {
        uint256 amount = IERC20(want).balanceOf(address(this));
        _balance += amount;
    }

    function withdraw(uint256 _amount) external {
        require(msg.sender == controller, "!controller");
        if (_amount > _balance) _amount = _balance;
        _balance -= _amount;
        IERC20(want).transfer(controller, _amount);
    }

    function withdrawAll() external returns (uint256) {
        require(msg.sender == controller, "!controller");
        uint256 amount = _balance;
        _balance = 0;
        IERC20(want).transfer(controller, amount);
        return amount;
    }

    function balanceOf() external view returns (uint256) {
        return _balance;
    }
}
