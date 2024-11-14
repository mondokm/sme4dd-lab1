import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'
import FtsrgNftModule from './FtsrgNft'
import AuctionFactoryModule from './AuctionFactory'

const SystemModule = buildModule('SystemModule', (m) => {
    const { auctionFactory } = m.useModule(AuctionFactoryModule)
    const { ftsrgNft } = m.useModule(FtsrgNftModule)

    return { auctionFactory, ftsrgNft }
})

export default SystemModule
