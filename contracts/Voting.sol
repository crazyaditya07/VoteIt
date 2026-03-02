// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Voting {
    struct Poll {
        string title;
        string description;
        address creator;
        uint256 createdAt;
        string[] options;
        mapping(uint256 => uint256) voteCounts;
        mapping(address => bool) hasVoted;
    }

    uint256 public pollCount;
    mapping(uint256 => Poll) public polls;

    event PollCreated(uint256 indexed pollId, address indexed creator);
    event VoteCast(uint256 indexed pollId, address indexed voter, uint256 optionIndex);

    function createPoll(string memory _title, string memory _description, string[] memory _options) external {
        require(_options.length > 0, "Must have at least one option");
        
        uint256 pollId = pollCount++;
        Poll storage newPoll = polls[pollId];
        newPoll.title = _title;
        newPoll.description = _description;
        newPoll.creator = msg.sender;
        newPoll.createdAt = block.timestamp;
        newPoll.options = _options;
        
        emit PollCreated(pollId, msg.sender);
    }

    function vote(uint256 pollId, uint256 optionIndex) external {
        require(pollId < pollCount, "Invalid poll ID");
        Poll storage poll = polls[pollId];
        require(!poll.hasVoted[msg.sender], "Already voted");
        require(optionIndex < poll.options.length, "Invalid option index");

        poll.hasVoted[msg.sender] = true;
        poll.voteCounts[optionIndex]++;

        emit VoteCast(pollId, msg.sender, optionIndex);
    }

    function getOptionsCount(uint256 pollId) external view returns (uint256) {
        require(pollId < pollCount, "Invalid poll ID");
        return polls[pollId].options.length;
    }

    function getOption(uint256 pollId, uint256 index) external view returns (string memory) {
        require(pollId < pollCount, "Invalid poll ID");
        require(index < polls[pollId].options.length, "Invalid option index");
        return polls[pollId].options[index];
    }
    
    function hasVoted(uint256 pollId, address voter) external view returns (bool) {
        require(pollId < pollCount, "Invalid poll ID");
        return polls[pollId].hasVoted[voter];
    }

    function getVoteCount(uint256 pollId, uint256 optionIndex) external view returns (uint256) {
        require(pollId < pollCount, "Invalid poll ID");
        require(optionIndex < polls[pollId].options.length, "Invalid option index");
        return polls[pollId].voteCounts[optionIndex];
    }
}
