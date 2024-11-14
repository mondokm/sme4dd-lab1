import { useState, useCallback, useEffect } from 'react'
import { Address } from 'viem'

export default function useAuctionStore() {
    const [auctions, setAuctions] = useState([] as Address[])

    const loadAuctions = useCallback(async () => {
        const auctionsString = window.localStorage.getItem('actions') ?? '[]'
        const auctions = JSON.parse(auctionsString)
        setAuctions(auctions)
    }, [])

    const addAuction = useCallback(
        async (auction: `0x${string}`) => {
            if (!auctions.includes(auction)) {
                const newAuctions = [auction, ...auctions]
                setAuctions(newAuctions)
                window.localStorage.setItem('actions', JSON.stringify(newAuctions))
            }
        },
        [auctions]
    )

    const removeAuction = useCallback(
        async (auction: `0x${string}`) => {
            const newAuctions = auctions.filter((a) => a !== auction)
            setAuctions(newAuctions)
            window.localStorage.setItem('actions', JSON.stringify(newAuctions))
        },
        [auctions]
    )

    useEffect(() => {
        loadAuctions()
    }, [loadAuctions])

    return [auctions, addAuction, removeAuction] as const
}
