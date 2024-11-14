import { BadgeProps, Badge } from 'primereact/badge'
import { Card } from 'primereact/card'
import { Timeline } from 'primereact/timeline'
import { useCallback } from 'react'
import { Auction, auctionMarkers, AuctionStage } from '../../common/auction'
import WaitingForFundingStage from './WaitingForFundingStage'
import { Address } from 'viem'
import BiddingStage from './BiddingStage'
import RevealStage from './RevealStage'
import EndStage from './EndStage'
import useNetwork from '../../hooks/useNetwork'
import useClient from '../../hooks/useClient'
import useAuction from '../../hooks/useAuction'

type Props = {
    auctionAddress: Address
    auction: Auction
    refresh: () => void
}

function ActionsCard({ auctionAddress, auction, refresh }: Props) {
    const [network] = useNetwork()
    const [client] = useClient()
    const [auctionContract] = useAuction(auctionAddress)

    const customizedMarker = useCallback(
        (item: (typeof auctionMarkers)[0]) => {
            let icon = null
            let color = null as BadgeProps['severity']
            if (auction && item.stage === AuctionStage.ENDED && auction.stage === AuctionStage.ENDED) {
                icon = 'pi pi-check'
                color = 'secondary'
            } else if (auction && auction.stage > item.stage) {
                icon = 'pi pi-check'
                color = 'secondary'
            } else if (auction && auction.stage < item.stage) {
                icon = 'pi pi-hourglass'
                color = 'secondary'
            } else if (auction && auction.stage === item.stage) {
                icon = 'pi pi-exclamation-circle'
                color = item.color
            }

            return <Badge severity={color ?? 'secondary'} value={<i className={icon ?? ''}></i>} size="large" />
        },
        [auction]
    )

    if (!network || !client || !auctionContract) {
        return <></>
    }

    return (
        <Card title="Actions" className="w-full h-full">
            <Timeline
                value={auctionMarkers}
                layout="horizontal"
                content={(marker) => marker.name}
                marker={customizedMarker}
                align="bottom"
            />
            {auction.stage === AuctionStage.WAITING_FOR_FUNDING && (
                <WaitingForFundingStage auctionAddress={auctionAddress} auction={auction} refresh={refresh} />
            )}
            {auction.stage === AuctionStage.BIDDING && (
                <BiddingStage auctionAddress={auctionAddress} auction={auction} refresh={refresh} />
            )}
            {auction.stage === AuctionStage.REVEAL && (
                <RevealStage auctionAddress={auctionAddress} auction={auction} refresh={refresh} />
            )}
            {auction.stage === AuctionStage.WAITING_FOR_END && (
                <EndStage
                    auctionAddress={auctionAddress}
                    auction={auction}
                    refresh={refresh}
                    showEndAuctionButton={true}
                />
            )}
            {auction.stage === AuctionStage.ENDED && (
                <EndStage
                    auctionAddress={auctionAddress}
                    auction={auction}
                    refresh={refresh}
                    showEndAuctionButton={false}
                />
            )}
        </Card>
    )
}

export default ActionsCard
