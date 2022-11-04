// Import ethers from Hardhat package
const { ethers } = require("hardhat");

async function main() {
  const rewardAmount = 10;
  const airdropContract = await ethers.getContractFactory("AirDrop");

  // here we deploy the contract
  const deployedAirdropContract = await airdropContract.deploy(rewardAmount);

  // wait for the contract to deploy
  await deployedAirdropContract.deployed();

  // print the address of the deployed contract
  console.log("Airdrop Contract Address:", deployedAirdropContract.address);
}

// Call the main function and catch if there is any error
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
