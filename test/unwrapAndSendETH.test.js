const { expect } = require('chai');
const { ethers } = require("hardhat");
const { to18, takeSnapshot, revertToSnapshot, deployContract } = require("../utils");

let user, user2, owner;
let userAddress, ownerAddress, user2Address, fundraiserAddress;

describe("UnwrapAndSendETH", function () {
  before(async function () {
    [owner, user, user2] = await ethers.getSigners();
    userAddress = user.address;
    user2Address = user2.address;

    this.mockContract = await deployContract("MockContract", owner);
    this.weth = await deployContract("MockWETH", owner);
    this.unwrapAndSendETH = await deployContract("UnwrapAndSendETH", owner, [this.weth.address]);
  });

  beforeEach(async function () {
    snapshotId = await takeSnapshot();
  });

  afterEach(async function () {
    await revertToSnapshot(snapshotId);
  });

  describe("unwrap weth and send eth", function () {
    this.beforeEach(async function () {
      await this.weth.connect(user).deposit({ value: to18('1') });
    });
    describe("reverts", async function () {
      it("reverts if zero WETH in contract ", async function () {
        await expect(
          this.unwrapAndSendETH.connect(user).unwrapAndSendETH(user2Address)
        ).to.be.revertedWith("Insufficient WETH");
      });
      it("reverts if to address doesn't accept eth", async function () {
        await this.weth
          .connect(user)
          .transfer(this.unwrapAndSendETH.address, to18("1"));
        await expect(
          this.unwrapAndSendETH
            .connect(user)
            .unwrapAndSendETH(this.mockContract.address)
        ).to.be.revertedWith("Eth transfer Failed.");
      });
    });

    describe("load, unwrap and send", async function () {
      beforeEach(async function () {
        // Load WETH into helper contract
        await this.weth
          .connect(user)
          .transfer(this.unwrapAndSendETH.address, to18("1"));
        await this.unwrapAndSendETH.unwrapAndSendETH(user2Address);
      });

      it("correctly unload weth/eth", async function () {
        expect(
          await this.weth.balanceOf(this.unwrapAndSendETH.address)
        ).to.be.equal("0");
        expect(
          await ethers.provider.getBalance(this.unwrapAndSendETH.address)
        ).to.be.equal("0");
      });

      it("correctly update user balance", async function () {
        expect(await this.weth.balanceOf(userAddress)).to.be.equal("0");
        expect(await ethers.provider.getBalance(user2Address)).to.be.equal(
          to18("10001")
        );
      });
    });
  });
});
