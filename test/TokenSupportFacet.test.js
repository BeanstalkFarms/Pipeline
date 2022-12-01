const { expect } = require('chai');
const { deployContract } = require('../utils/contracts.js');
const { signERC2612Permit } = require("eth-permit");
const { takeSnapshot, revertToSnapshot } = require("../utils/snapshot");

let user, user2, owner;

describe('External Token', function () {
    before(async function () {
        [owner, user, user2] = await ethers.getSigners();
        this.tokenSupport = await deployContract("TokenSupportFacet", owner)
        const Token = await ethers.getContractFactory("MockToken");
        this.token = await Token.deploy("Mock", "MOCK")
        await this.token.deployed()

        this.erc1155 = await (await ethers.getContractFactory('MockERC1155', owner)).deploy('Mock')
        await this.erc1155.connect(user).setApprovalForAll(this.tokenSupport.address, true)

        this.erc721 = await (await ethers.getContractFactory('MockERC721', owner)).deploy()
    });

    beforeEach(async function () {
        snapshotId = await takeSnapshot();
    });

    afterEach(async function () {
        await revertToSnapshot(snapshotId);
    });

    describe("Permit ERC-20 token", async function () {
        it('legit', async function () {
            result = await signERC2612Permit(
                ethers.provider,
                this.token.address,
                user.address,
                this.tokenSupport.address,
                '10000000'
            );

            await this.tokenSupport.connect(user).permitERC20(
                this.token.address,
                user.address,
                this.tokenSupport.address,
                '10000000',
                result.deadline,
                result.v,
                result.r,
                result.s
            )
        })
        expect(await this.token.allowance(user.address, this.tokenSupport.address)).to.be.equal('10000000')

        it('fake', async function () {
            fakeResult = await signERC2612Permit(
                ethers.provider,
                user.address,
                user.address,
                owner.address,
                '10000000'
            );

            await expect(this.tokenSupport.connect(user).permitERC20(
                this.bean.address,
                user.address,
                this.tokenSupport.address,
                toBean('10'),
                fakeResult.deadline,
                fakeResult.v,
                fakeResult.r,
                fakeResult.s
            )).to.be.revertedWith('ERC20Permit: invalid signature')
        });

        it('revert deadline passed', async function () {
            endedResult = await signERC2612Permit(
                ethers.provider,
                this.token.address,
                user.address,
                this.tokenSupport.address,
                '10000000',
                '1'
            );

            await expect(this.tokenSupport.connect(user).permitERC20(
                this.bean.address,
                user.address,
                this.tokenSupport.address,
                toBean('10'),
                endedResult.deadline,
                endedResult.v,
                endedResult.r,
                endedResult.s
            )).to.be.revertedWith("ERC20Permit: expired deadline")
        });
    })

    describe("Transfer ERC-1155", async function () {
        beforeEach(async function () {
            await this.erc1155.mockMint(user.address, '0', '5')
            await this.tokenSupport.connect(user).transferERC1155(this.erc1155.address, user2.address, '0', '2')
        })

        it('transfers ERC-1155', async function () {
            expect(await this.erc1155.balanceOf(user2.address, '0')).to.be.equal('2')
            expect(await this.erc1155.balanceOf(user.address, '0')).to.be.equal('3')
        })
    })

    describe("Batch Transfer ERC-1155", async function () {
        beforeEach(async function () {
            await this.erc1155.mockMint(user.address, '0', '5')
            await this.erc1155.mockMint(user.address, '1', '10')
            await this.tokenSupport.connect(user).batchTransferERC1155(this.erc1155.address, user2.address, ['0', '1'], ['2', '3'])
        })

        it('transfers ERC-1155', async function () {
            const balances = await this.erc1155.balanceOfBatch(
                [user2.address, user2.address, user.address, user.address],
                ['0', '1', '0', '1']
            )
            expect(balances[0]).to.be.equal('2')
            expect(balances[1]).to.be.equal('3')
            expect(balances[2]).to.be.equal('3')
            expect(balances[3]).to.be.equal('7')
        })
    })

    describe("Transfer ERC-721", async function () {
        beforeEach(async function () {
            await this.erc721.mockMint(user.address, '0')
            await this.erc721.connect(user).approve(this.tokenSupport.address, '0')
            await this.tokenSupport.connect(user).transferERC721(this.erc721.address, user2.address, '0')
        })

        it('transfers ERC-721', async function () {
            expect(await this.erc721.ownerOf('0')).to.be.equal(user2.address)
        })
    })

    describe("Permit and transfer ERC-721", async function () {
        beforeEach(async function () {
            await this.erc721.mockMint(user.address, '0')

            await this.tokenSupport.connect(user).permitERC721(
                this.erc721.address,
                this.tokenSupport.address,
                '0',
                '0',
                ethers.constants.HashZero
            )

            await this.tokenSupport.connect(user).transferERC721(
                this.erc721.address, user2.address, '0'
            )
        })

        it('transfers ERC-721', async function () {
            expect(await this.erc721.ownerOf('0')).to.be.equal(user2.address)
        })
    })
})