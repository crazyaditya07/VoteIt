import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("Voting Contract", function () {
    async function deployVotingFixture() {
        const [owner, voter1, voter2] = await ethers.getSigners();

        const title = "Proposal 1";
        const description = "Test proposal description";
        const options = ["Yes", "No", "Abstain"];

        const Voting = await ethers.getContractFactory("Voting");
        const voting = await Voting.deploy(title, description, options);

        return { voting, owner, voter1, voter2, title, description, options };
    }

    describe("Deployment", function () {
        it("Should correctly set title, description, and options", async function () {
            const { voting, title, description, options } = await loadFixture(deployVotingFixture);

            expect(await voting.title()).to.equal(title);
            expect(await voting.description()).to.equal(description);
            expect(await voting.getOptionsCount()).to.equal(options.length);

            for (let i = 0; i < options.length; i++) {
                expect(await voting.getOption(i)).to.equal(options[i]);
            }
        });

        it("Should revert if deployed with no options", async function () {
            const Voting = await ethers.getContractFactory("Voting");
            await expect(Voting.deploy("Title", "Desc", [])).to.be.revertedWith("Must have at least one option");
        });
    });

    describe("Voting Process", function () {
        it("Should allow a user to vote and emit VoteCast event", async function () {
            const { voting, voter1 } = await loadFixture(deployVotingFixture);

            const optionIndex = 0;
            await expect(voting.connect(voter1).vote(optionIndex))
                .to.emit(voting, "VoteCast")
                .withArgs(voter1.address, optionIndex);

            expect(await voting.hasVoted(voter1.address)).to.equal(true);
            expect(await voting.voteCounts(optionIndex)).to.equal(1);
        });

        it("Should prevent double voting", async function () {
            const { voting, voter1 } = await loadFixture(deployVotingFixture);

            const optionIndex = 0;
            await voting.connect(voter1).vote(optionIndex);

            await expect(voting.connect(voter1).vote(1)).to.be.revertedWith("Already voted");
        });

        it("Should revert when voting for invalid option", async function () {
            const { voting, voter1, options } = await loadFixture(deployVotingFixture);

            await expect(voting.connect(voter1).vote(options.length)).to.be.revertedWith("Invalid option index");
        });
    });
});
