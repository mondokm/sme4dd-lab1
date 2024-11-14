import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers'
import { time } from '@nomicfoundation/hardhat-network-helpers'
import { expect } from 'chai'
import hre from 'hardhat'
import { getAddress, parseEther } from 'viem'

describe('Simple auction', function () {
    async function deploySimpleAuctionFixture() {
        const publicClient = await hre.viem.getPublicClient()

        const [owner, client1, client2] = await hre.viem.getWalletClients()

        const ownerAddr = getAddress(owner.account.address)
        const addr1 = getAddress(client1.account.address)
        const addr2 = getAddress(client2.account.address)

        const deployTime = await time.latest()

        const simpleAuction = await hre.viem.deployContract('SimpleAuction', [BigInt(deployTime + 100), ownerAddr])

        return { simpleAuction, owner, client1, client2, ownerAddr, addr1, addr2, deployTime, publicClient }
    }

    describe('Deployment', function () {
        it('Should set the beneficiary', async function () {
            const { simpleAuction, ownerAddr } = await loadFixture(deploySimpleAuctionFixture)
            expect(await simpleAuction.read.beneficiary()).to.equal(ownerAddr)
        })

        it('Should set the bidding end', async function () {
            const { simpleAuction, deployTime } = await loadFixture(deploySimpleAuctionFixture)
            expect(await simpleAuction.read.biddingEnd()).to.equal(deployTime + 100)
        })
    })

    describe('Bidding', function () {
        it('Single bid', async function () {
            const { simpleAuction, client1, addr1 } = await loadFixture(deploySimpleAuctionFixture)

            await simpleAuction.write.bid({ account: client1.account, value: parseEther('0.5') })

            expect(await simpleAuction.read.highestBid()).to.equal(parseEther('0.5'))
            expect(await simpleAuction.read.highestBidder()).to.equal(addr1)
        })

        it('Two bids', async function () {
            const { simpleAuction, client1, client2, addr1, addr2 } = await loadFixture(deploySimpleAuctionFixture)

            await simpleAuction.write.bid({ account: client1.account, value: parseEther('0.5') })

            expect(await simpleAuction.read.highestBid()).to.equal(parseEther('0.5'))
            expect(await simpleAuction.read.highestBidder()).to.equal(addr1)

            await simpleAuction.write.bid({ account: client2.account, value: parseEther('1') })

            expect(await simpleAuction.read.highestBid()).to.equal(parseEther('1'))
            expect(await simpleAuction.read.highestBidder()).to.equal(addr2)
        })

        it('Should emit HighestBidIncreased(msg.sender, msg.value) if bid increased', async function () {
            const { simpleAuction, client1, client2, addr1, addr2 } = await loadFixture(deploySimpleAuctionFixture)

            await simpleAuction.write.bid({ account: client1.account, value: parseEther('0.5') })

            await expect(await simpleAuction.write.bid({ account: client2.account, value: parseEther('1') }))
                .to.emit(simpleAuction, 'HighestBidIncreased')
                .withArgs(getAddress(addr2), parseEther('1'))
        })

        it('Should revert if bid is not high enough', async function () {
            const { simpleAuction, client1, client2, addr1 } = await loadFixture(deploySimpleAuctionFixture)

            await simpleAuction.write.bid({ account: client1.account, value: parseEther('0.5') })

            await expect(simpleAuction.write.bid({ account: client2.account, value: parseEther('0.5') }))
                .to.be.revertedWithCustomError(simpleAuction, 'BidNotHighEnough')
                .withArgs(parseEther('0.5'))
        })
    })

    describe('Returns', function () {
        it('Bids that were overbid get added to pendingReturns', async function () {
            const { simpleAuction, client1, client2, addr1, addr2 } = await loadFixture(deploySimpleAuctionFixture)

            await simpleAuction.write.bid({ account: client1.account, value: parseEther('0.5') })
            await simpleAuction.write.bid({ account: client2.account, value: parseEther('1') })

            expect(await simpleAuction.read.pendingReturns([getAddress(addr1)])).to.equal(parseEther('0.5'))
            expect(await simpleAuction.read.pendingReturns([getAddress(addr2)])).to.equal(parseEther('0'))
        })

        it('Pending returns accumulate correctly', async function () {
            const { simpleAuction, client1, client2, addr1, addr2 } = await loadFixture(deploySimpleAuctionFixture)

            await simpleAuction.write.bid({ account: client1.account, value: parseEther('0.5') })
            await simpleAuction.write.bid({ account: client1.account, value: parseEther('1') })
            await simpleAuction.write.bid({ account: client1.account, value: parseEther('2') })

            expect(await simpleAuction.read.pendingReturns([getAddress(addr1)])).to.equal(parseEther('1.5'))
            expect(await simpleAuction.read.pendingReturns([getAddress(addr2)])).to.equal(parseEther('0'))
        })

        it('Bids that were overbid can be withdrawn', async function () {
            const { simpleAuction, client1, client2, addr1, addr2, publicClient } =
                await loadFixture(deploySimpleAuctionFixture)

            await simpleAuction.write.bid({ account: client1.account, value: parseEther('0.5') })
            await simpleAuction.write.bid({ account: client2.account, value: parseEther('1') })

            const initialBalance = await publicClient.getBalance({ address: addr1 })

            // const gasEstimate = await simpleAuction.estimateGas.withdraw({ account: client1.account })
            // const gasPrice = await publicClient.getGasPrice()
            // const totalGasCost = gasEstimate * gasPrice // Total gas cost

            await simpleAuction.write.withdraw({ account: client1.account })

            const endingBalance = await publicClient.getBalance({ address: addr1 })

            expect(await simpleAuction.read.pendingReturns([getAddress(addr1)])).to.equal(parseEther('0'))
            expect(endingBalance).to.be.greaterThan(initialBalance + parseEther('0.4'))
            expect(endingBalance).to.be.lessThanOrEqual(initialBalance + parseEther('0.5'))
        })
    })
})
