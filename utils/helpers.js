function toBN(a) {
return ethers.BigNumber.from(a)
}

function to18(a) {
    return ethers.utils.parseEther(a)
}

exports.toBN = toBN
exports.to18 = to18