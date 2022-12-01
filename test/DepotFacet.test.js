const { expect } = require('chai');
const { defaultAbiCoder } = require('ethers/lib/utils.js');
const { impersonatePipeline } = require('../scripts/pipeline.js');
const { deployContract, impersonateSigner, toBN, to18, encodeAdvancedData, takeSnapshot, revertToSnapshot } = require('../utils');

let user, user2, owner;

describe('Depot Facet', function () {
  before(async function () {
    [owner, user, user2] = await ethers.getSigners();
    this.depot = await deployContract("DepotFacet", owner)

    this.weth = await deployContract("MockWETH", owner);
    this.token = await deployContract("MockToken", owner, ['Token', 'TOKEN'])

    const account = impersonateSigner('0x533545dE45Bd44e6B5a6D649256CCfE3b6E1abA6')
    pipeline = await impersonatePipeline(account)

    this.mockContract = await (await ethers.getContractFactory('MockContract', owner)).deploy()
    await this.mockContract.deployed()
    await this.mockContract.setAccount(user2.address)

    await this.token.mint(user.address, '1000')
    await this.token.connect(user).approve(this.depot.address, '1000')
  });

  beforeEach(async function () {
    snapshotId = await takeSnapshot();
  });

  afterEach(async function () {
    await revertToSnapshot(snapshotId);
  });

  describe("Normal Pipe", async function () {
    describe("1 Pipe", async function () {
      beforeEach(async function () {
        const mint = this.token.interface.encodeFunctionData('mint', [
          pipeline.address,
          '100'
        ])
        await this.depot.connect(user).pipe([this.token.address, mint])
      })

      it('mints tokens', async function () {
        expect(await this.token.balanceOf(pipeline.address)).to.be.equal('100')
      })
    })

    describe("Multi Pipe", async function () {
      beforeEach(async function () {
        const mint = this.token.interface.encodeFunctionData('mint', [
          pipeline.address,
          '100'
        ])
        const approve = await this.token.interface.encodeFunctionData('approve', [
          this.depot.address,
          '100'
        ])
        const tokenTransfer = this.token.interface.encodeFunctionData('transfer', [
          user2.address, '100'
        ])
        await this.depot.connect(user).multiPipe(
          [[this.token.address, mint], [this.token.address, approve], [this.token.address, tokenTransfer]]
        )
      })

      it('mints and transfers tokens', async function () {
        expect(await this.token.balanceOf(user2.address)).to.be.equal('100')
      })
    })
  })

  describe("Ether Pipe", async function () {
    beforeEach(async function () {
      selector = this.weth.interface.encodeFunctionData('deposit', [])
      await this.depot.connect(user).etherPipe([this.weth.address, selector], to18('1'), {value: to18('1')})
    })

    it("wraps Eth", async function () {
      expect(await this.weth.balanceOf(pipeline.address)).to.be.equal(to18('1'))
      expect(await ethers.provider.getBalance(this.weth.address)).to.be.equal(to18('1'))
    })
  })

  describe("Advanced Pipe", async function () {
    it('reverts if non-existent type', async function () {
      selector = this.weth.interface.encodeFunctionData('deposit', [])
      data = encodeAdvancedData(9)
      await expect(this.depot.connect(user).advancedPipe(
        [[this.weth.address, selector, data]], to18('0')
      )).to.be.revertedWith('Function: Advanced Type not supported')
    })

    describe("Ether Pipe", async function () {
      beforeEach(async function () {
        selector = this.weth.interface.encodeFunctionData('deposit', [])
        selector2 = await this.weth.interface.encodeFunctionData('approve', [
          this.depot.address,
          to18('1')
        ])
        selector3 = this.weth.interface.encodeFunctionData('transfer', [
          user.address, to18('1')
        ])
        data = encodeAdvancedData(0, to18('1'))
        data23 = encodeAdvancedData(0)
        await this.depot.connect(user).advancedPipe(
        [
          [this.weth.address, selector, data],
          [this.weth.address, selector2, data23],
          [this.weth.address, selector3, data23]
        ], to18('1'), {value: to18('1')}
        )
      })

      it("wraps Eth and transfers to user internal", async function () {
        expect(await this.weth.balanceOf(user.address)).to.be.equal(to18('1'))
        expect(await ethers.provider.getBalance(this.weth.address)).to.be.equal(to18('1'))
      })
    })

    describe("Return data", async function () {
      beforeEach(async function () {
        await this.token.connect(user).transfer(pipeline.address, '1')
        selector = this.token.interface.encodeFunctionData('balanceOf', [pipeline.address])
        data = encodeAdvancedData(0)
        selector2 = this.token.interface.encodeFunctionData('transfer', [user2.address, '0'])
        data2 = encodeAdvancedData(1, value=toBN('0'), copyData=[0, 32, 68])
        await this.depot.connect(user).advancedPipe(
        [
          [this.token.address, selector, data],
          [this.token.address, selector2, data2],
        ], to18('0')
        )
      })

      it("wraps Eth and transfers to user internal", async function () {
        expect(await this.token.balanceOf(pipeline.address)).to.be.equal(toBN('0'))
        expect(await this.token.balanceOf(user2.address)).to.be.equal(toBN('1'))
      })
    })

    describe("Multiple return data", async function () {
      beforeEach(async function () {
        await this.token.connect(user).transfer(pipeline.address, toBN('1'))
        selector = this.token.interface.encodeFunctionData('balanceOf', [pipeline.address])
        selector2 = this.mockContract.interface.encodeFunctionData('getAccount', [])
        data12 = encodeAdvancedData(0)
        selector3 = this.token.interface.encodeFunctionData('transfer', [user.address, toBN('1')])
        data3 = encodeAdvancedData(2, value=toBN('0'), copyData=[[0, 32, 68], [1, 32, 36]])
        await this.depot.connect(user).advancedPipe(
        [
          [this.token.address, selector, data12],
          [this.mockContract.address, selector2, data12],
          [this.token.address, selector3, data3],
        ], to18('0')
        )
      })

      it("wraps Eth and transfers to user internal", async function () {
        expect(await this.token.balanceOf(pipeline.address)).to.be.equal(toBN('0'))
        expect(await this.token.balanceOf(user2.address)).to.be.equal(toBN('1'))
      })
    })
  })

  describe("Read Pipe", async function () {
    it("returns a value", async function () {
      selector = this.token.interface.encodeFunctionData('balanceOf', [user.address])
      const pipeResult = await this.depot.readPipe([this.token.address, selector])
      expect(defaultAbiCoder.decode(['uint256'], pipeResult)[0]).to.be.equal(toBN('1000'))
    })
  })
})