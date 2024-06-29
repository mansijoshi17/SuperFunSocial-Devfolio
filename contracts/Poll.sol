// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PollContract {
    struct Poll {
        string id;
        string name;
        mapping(uint => uint) choices; // Choice number to votes count
        uint[] choiceList;             // List to keep track of active choices
        mapping(address => bool) voters; // Track if an address has voted
    }
    
    mapping(string => Poll) private polls;

    // Event to emit when a vote is cast
    event VoteCasted(string indexed pollId, uint choice, uint votes);

    // Function to create a new poll
    function createPoll(string calldata name, uint numChoices, string calldata pollId) public returns (string calldata) {
        Poll storage p = polls[pollId];
        p.id = pollId;
        p.name = name;

        // Initialize each choice with 0 votes and track the choice number
        for (uint i = 1; i <= numChoices; i++) {
            p.choices[i] = 0;
            p.choiceList.push(i);  // Store the choice index
        }

        return pollId;
    }

    // Function to vote on a poll
    function vote(string calldata pollId, uint choice) public {
        Poll storage p = polls[pollId];
        require(choice != 0 && choice <= p.choiceList.length, "Invalid choice");
        require(!p.voters[msg.sender], "You have already voted!");

        // Record that the voter has voted
        p.voters[msg.sender] = true;

        // Increment the vote count for the chosen option
        p.choices[choice]++;
        emit VoteCasted(pollId, choice, p.choices[choice]);
    }

    // Function to get the total votes for each choice in a poll
    function getVotes(string calldata pollId) public view returns (uint[] memory votes) {
        Poll storage p = polls[pollId];
        votes = new uint[](p.choiceList.length);

        for (uint i = 0; i < p.choiceList.length; i++) {
            votes[i] = p.choices[p.choiceList[i]];
        }

        return votes;
    }
}
