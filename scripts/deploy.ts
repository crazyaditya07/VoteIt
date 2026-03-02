import { ethers } from "hardhat";

async function main() {
    const title = "Community Treasury";
    const description = "Should we fund the new open-source initiative?";
    const options = ["Yes", "No", "Abstain"];

    console.log(`Deploying Voting Contract...`);
    console.log(`Title: ${title}`);

    const Voting = await ethers.getContractFactory("Voting");
    const voting = await Voting.deploy(title, description, options);

    await voting.waitForDeployment();

    const address = await voting.getAddress();

    console.log(`Voting contract deployed to: ${address}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
