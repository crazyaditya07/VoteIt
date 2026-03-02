import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("Voting Contract", function () {
    async function deployVotingFixture() {
        const [owner, voter1, voter2] = await ethers.getSigners();

        const Voting = await ethers.getContractFactory("Voting");
        const voting = await Voting.deploy();

        const title = "Proposal 1";
        const description = "Test proposal description";
        const options = ["Yes", "No", "Abstain"];

        return { voting, owner, voter1, voter2, title, description, options };
    }

    describe("Deployment", function () {
        it("Should initialize with zero polls", async function () {
            const { voting } = await loadFixture(deployVotingFixture);
            expect(await voting.pollCount()).to.equal(0);
        });
    });

    describe("Poll Creation", function () {
        it("Should create a new poll and emit event", async function () {
            const { voting, owner, title, description, options } = await loadFixture(deployVotingFixture);

            await expect(voting.createPoll(title, description, options))
                .to.emit(voting, "PollCreated")
                .withArgs(0, owner.address);

            expect(await voting.pollCount()).to.equal(1);

            const poll = await voting.polls(0);
            expect(poll.title).to.equal(title);
            expect(poll.description).to.equal(description);
            expect(poll.creator).to.equal(owner.address);

            expect(await voting.getOptionsCount(0)).to.equal(options.length);
            for (let i = 0; i < options.length; i++) {
                expect(await voting.getOption(0, i)).to.equal(options[i]);
            }
        });

        it("Should revert if deployed with no options", async function () {
            const { voting, title, description } = await loadFixture(deployVotingFixture);
            await expect(voting.createPoll(title, description, [])).to.be.revertedWith("Must have at least one option");
        });
    });

    describe("Voting Process", function () {
        async function createPollFixture() {
            const fixture = await deployVotingFixture();
            const { voting, title, description, options } = fixture;
            await voting.createPoll(title, description, options);
            return fixture;
        }

        it("Should allow a user to vote in a specific poll and emit VoteCast event", async function () {
            const { voting, voter1 } = await loadFixture(createPollFixture);

            const pollId = 0;
            const optionIndex = 0;
            await expect(voting.connect(voter1).vote(pollId, optionIndex))
                .to.emit(voting, "VoteCast")
                .withArgs(pollId, voter1.address, optionIndex);

            expect(await voting.hasVoted(pollId, voter1.address)).to.equal(true);
            expect(await voting.getVoteCount(pollId, optionIndex)).to.equal(1);
        });

        it("Should prevent double voting in the same poll", async function () {
            const { voting, voter1 } = await loadFixture(createPollFixture);

            const pollId = 0;
            const optionIndex = 0;
            await voting.connect(voter1).vote(pollId, optionIndex);

            await expect(voting.connect(voter1).vote(pollId, 1)).to.be.revertedWith("Already voted");
        });

        it("Should allow voting in different polls", async function () {
            const { voting, voter1, title, description, options } = await loadFixture(createPollFixture);

            await voting.createPoll(title, description, options); // Poll 1

            await voting.connect(voter1).vote(0, 0);
            await expect(voting.connect(voter1).vote(1, 1)).to.emit(voting, "VoteCast");
        });

        it("Should revert when voting for invalid option", async function () {
            const { voting, voter1, options } = await loadFixture(createPollFixture);

            await expect(voting.connect(voter1).vote(0, options.length)).to.be.revertedWith("Invalid option index");
        });

        it("Should revert when voting for invalid poll", async function () {
            const { voting, voter1 } = await loadFixture(createPollFixture);

            await expect(voting.connect(voter1).vote(1, 0)).to.be.revertedWith("Invalid poll ID");
        });
    });
});
