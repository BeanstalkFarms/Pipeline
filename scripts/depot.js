var fs = require('fs');
const { DEPOT, DEPOT_DEPLOYER } = require('../test/utils/constants');
const { impersonateSigner, mintEth } = require('../utils');
const { deployAtNonce } = require('./contracts');

const DEPOT = '0xDEb0f000082fD56C10f449d4f8497682494da84D'
const DEPOT_DEPLOYER = '0x2ab5D0acF1A61A2D6935f8Cfb2B1CAA2Fc3Ffbda'

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