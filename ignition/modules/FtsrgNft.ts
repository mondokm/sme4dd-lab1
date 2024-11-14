import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

const FtsrgNftModule = buildModule('FtsrgNftModule', (m) => {
    const ftsrgNft = m.contract('FtsrgNft', ['FTSRG NFT', 'FTSRG'])

    const owner = m.getAccount(0)
    m.call(ftsrgNft, 'mintTo', [owner])

    return { ftsrgNft }
})

export default FtsrgNftModule
