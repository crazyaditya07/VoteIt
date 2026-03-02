import { ethers } from "hardhat";

async function main() {
    console.log(`Deploying Voting Contract Registry...`);

    const Voting = await ethers.getContractFactory("Voting");
    const voting = await Voting.deploy();

    await voting.waitForDeployment();

    const address = await voting.getAddress();

    console.log(`Voting registry contract deployed to: ${address}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
