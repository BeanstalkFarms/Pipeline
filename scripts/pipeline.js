var fs = require('fs');
const { impersonateSigner, mintEth, deployAtNonce } = require('../utils');

const PIPELINE = '0xb1bE0000C6B3C62749b5F0c92480146452D15423'
const PIPELINE_DEPLOYER = '0x77e7C6E889dE7a14744d29899Ba097379aeE06Ab'

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