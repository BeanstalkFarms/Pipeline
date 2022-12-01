var fs = require('fs');
const { impersonateSigner, mintEth, deployAtNonce } = require('../utils');

const PIPELINE = '0xb1bE0000bFdcDDc92A8290202830C4Ef689dCeaa'
const PIPELINE_DEPLOYER = '0x36585Dee035286F41d842DD858aCA1ddF1d00925'

async function deploy(account=undefined) {
  if (account == undefined) {
    account = await impersonateSigner(PIPELINE_DEPLOYER)
    await mintEth(account.address)
  }
  return await deployAtNonce('Pipeline', account, n = 3)
}

async function impersonate() {
  let json = fs.readFileSync(`./artifacts/contracts/Pipeline.sol/Pipeline.json`);
  await network.provider.send("hardhat_setCode", [
    PIPELINE,
    JSON.parse(json).deployedBytecode,
  ]);
  return await ethers.getContractAt('Pipeline', PIPELINE)
}

exports.deployPipeline = deploy
exports.impersonatePipeline = impersonate