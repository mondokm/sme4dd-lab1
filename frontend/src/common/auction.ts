import { Address } from 'viem'

export enum AuctionStage {
    WAITING_FOR_FUNDING,
    BIDDING,
    REVEAL,
    WAITING_FOR_END,
    ENDED
}

export type Auction = {
    beneficiaryAddress: Address
    biddingEnd: Date
    revealEnd: Date
    nftAddress: Address
    nftTokenId: number
    nftDescriptor: { name: string; description: string; image: string } | null
    stage: AuctionStage
    highestBid: number
    highestBidder: Address
}

export const auctionMarkers = [
    {
        stage: AuctionStage.WAITING_FOR_FUNDING,
        name: 'Waiting for funding',
        color: 'warning'
    } as const,
    {
        stage: AuctionStage.BIDDING,
        name: 'Bidding',
        color: 'success'
    } as const,
    {
        stage: AuctionStage.REVEAL,
        name: 'Reveal',
        color: 'warning'
    } as const,
    {
        stage: AuctionStage.WAITING_FOR_END,
        name: 'Waiting for end',
        color: 'info'
    } as const,
    {
        stage: AuctionStage.ENDED,
        name: 'Ended',
        color: 'secondary'
    } as const
]
