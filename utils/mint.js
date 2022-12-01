async function mintEth(address) {
    await hre.network.provider.send("hardhat_setBalance", [address, "0x3635C9ADC5DEA00000"]);
}

exports.mintEth = mintEth