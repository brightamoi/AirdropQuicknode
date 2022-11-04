//SPDX-License-Identifier: MIT 
pragma solidity ^0.8.9;

// Import the openzepplin contract
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract AirDrop is ERC20 {
    uint256 public _totalSupply = 70000 * (10 **18);
    uint256 public rewardAmount;
    mapping(address => bool) claimed;

    constructor(uint256 _rewardAmount) ERC20("Save The Elephants", "STE") {
        _mint(msg.sender, _totalSupply);
        rewardAmount = _rewardAmount;
    }

    function claim() external {
        require(!claimed[msg.sender], "Already claimed air drop");
        require(_totalSupply > 0, "No more STE left");
        claimed[msg.sender] = true;
        _mint(msg.sender, rewardAmount);
        _totalSupply -= rewardAmount;
    }
}