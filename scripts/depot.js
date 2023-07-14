var fs = require('fs');
const { DEPOT, DEPOT_DEPLOYER } = require('../test/utils/constants');
const { impersonateSigner, mintEth } = require('../utils');
const { deployAtNonce } = require('./contracts');

const DEPOT = '0xDEb0f00071497a5cc9b4A6B96068277e57A82Ae2'
const DEPOT_DEPLOYER = '0x058a783D98cDBB78d403c6B613C17d6b96f20d06'

async function deploy(account=undefined) {
  if (account == undefined) {
    account = await impersonateSigner(DEPOT_DEPLOYER)
    await mintEth(account.address)
  }
  return await deployAtNonce('Depot', account, n = 7)
}
async function impersonate() {
  let json = fs.readFileSync(`./artifacts/contracts/Depot.sol/Depot.json`);
  await network.provider.send("hardhat_setCode", [
    DEPOT,
    JSON.parse(json).deployedBytecode,
  ]);
  return await ethers.getContractAt("Depot", DEPOT)
}

exports.deployDepot = deploy
exports.impersonateDepot = impersonate