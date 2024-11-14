import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

const AuctionFactoryModule = buildModule('AuctionFactoryModule', (m) => {
    const auctionFactory = m.contract('AuctionFactory', [])
    return { auctionFactory }
})

export default AuctionFactoryModule
