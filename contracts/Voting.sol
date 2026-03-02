// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Voting {
    string public title;
    string public description;
    string[] public options;

    mapping(address => bool) public hasVoted;
    mapping(uint256 => uint256) public voteCounts;

    event VoteCast(address indexed voter, uint256 optionIndex);

    constructor(
        string memory _title,
        string memory _description,
        string[] memory _options
    ) {
        require(_options.length > 0, "Must have at least one option");
        title = _title;
        description = _description;
        options = _options;
    }

    function vote(uint256 optionIndex) external {
        require(!hasVoted[msg.sender], "Already voted");
        require(optionIndex < options.length, "Invalid option index");

        hasVoted[msg.sender] = true;
        voteCounts[optionIndex]++;

        emit VoteCast(msg.sender, optionIndex);
    }

    function getOptionsCount() external view returns (uint256) {
        return options.length;
    }

    function getOption(uint256 index) external view returns (string memory) {
        require(index < options.length, "Invalid option index");
        return options[index];
    }
}
