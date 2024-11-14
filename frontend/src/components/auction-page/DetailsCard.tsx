import { Card } from 'primereact/card'
import { Tag } from 'primereact/tag'
import { Address } from 'viem'
import { Auction, auctionMarkers, AuctionStage } from '../../common/auction'

type Props = {
    auctionAddress: Address
    auction: Auction
    lastBlockTimestamp: Date
}

function DetailsCard({ auctionAddress, auction, lastBlockTimestamp }: Props) {
    function renderStage(stage: AuctionStage) {
        const marker = auctionMarkers.find((marker) => marker.stage === stage)
        if (marker) {
            return <Tag value={marker.name} severity={marker.color} />
        }

        return <></>
    }

    return (
        <Card title="Details" className="w-full h-full">
            <div className="grid align-items-center">
                <b className="col-12 md:col-3">Address:</b>
                <span className="col-12 md:col-9 overflow-hidden" style={{ textOverflow: 'ellipsis' }}>
                    {auctionAddress}
                </span>
                <b className="col-12 md:col-3">Beneficiary:</b>
                <span className="col-12 md:col-9 overflow-hidden" style={{ textOverflow: 'ellipsis' }}>
                    {auction.beneficiaryAddress}
                </span>
                <b className="col-12 md:col-3">Bidding end:</b>
                <span className="col-12 md:col-9 overflow-hidden" style={{ textOverflow: 'ellipsis' }}>
                    {auction.biddingEnd.toLocaleString()}
                </span>
                <b className="col-12 md:col-3">Reveal end:</b>
                <span className="col-12 md:col-9 overflow-hidden" style={{ textOverflow: 'ellipsis' }}>
                    {auction.revealEnd.toLocaleString()}
                </span>
                <b className="col-12 md:col-3">Last block timestamp:</b>
                <span className="col-12 md:col-9 overflow-hidden" style={{ textOverflow: 'ellipsis' }}>
                    {lastBlockTimestamp.toLocaleString()}
                </span>
                <b className="col-12 md:col-3">NFT address:</b>
                <span className="col-12 md:col-9 overflow-hidden" style={{ textOverflow: 'ellipsis' }}>
                    {auction.nftAddress}
                </span>
                <b className="col-12 md:col-3">NFT token ID:</b>
                <span className="col-12 md:col-9 overflow-hidden" style={{ textOverflow: 'ellipsis' }}>
                    {auction.nftTokenId}
                </span>
                <b className="col-12 md:col-3">Stage:</b>
                <span className="col-12 md:col-9 overflow-hidden" style={{ textOverflow: 'ellipsis' }}>
                    {renderStage(auction.stage)}
                </span>
            </div>
        </Card>
    )
}

export default DetailsCard
