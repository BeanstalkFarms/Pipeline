async function deploy(name, account, args = [], verbose = false) {
  
  const contract = args.length > 0 ? 
    await (await ethers.getContractFactory(name, account)).deploy(...args) :
    await (await ethers.getContractFactory(name, account)).deploy()

  await contract.deployed()
  if (verbose) console.log(`${name} deployed to: ${contract.address}`)
  return contract
}

async function deployAtNonce(name, account, nonce, verbose = false) {
  if (verbose) console.log(`Start Nonce: ${await ethers.provider.getTransactionCount(account.address)}`)
  await increaseToNonce(account, nonce)
  if (verbose) console.log(`Deploying Contract with nonce: ${await ethers.provider.getTransactionCount(account.address)}`)
  return await deploy(name, account, true)
}

async function increaseToNonce(account, nonce) {
  const currentNonce = await ethers.provider.getTransactionCount(account.address)
  await increaseNonce(account, nonce-currentNonce-1)
}

async function increaseNonce(account, n = 1) {
    for (let i = 0; i < n; i++) {
      await account.sendTransaction({
          to: account.address,
          value: ethers.utils.parseEther("0"),
      })
    }
}

exports.increaseNonce = increaseNonce
exports.deployContract = deploy
exports.deployAtNonce = deployAtNonce