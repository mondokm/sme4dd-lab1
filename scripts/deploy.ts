import hre from 'hardhat'
import SystemModule from '../ignition/modules/System'

async function main() {
    const { ftsrgNft, auctionFactory } = await hre.ignition.deploy(SystemModule)

    console.log(`Ftsrg NFT deployed to: ${ftsrgNft.address}`)
    console.log(`Auction factory deployed to: ${auctionFactory.address}`)
}

main().catch((e) => {
    console.error(e)
    process.exitCode = 1
})
