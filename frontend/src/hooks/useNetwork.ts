import { useCallback, useEffect, useState } from 'react'
import { INetwork } from '../networks/Deployment'
import { HardhatNetwork } from '../networks/HardhatNetwork'

const Networks = [HardhatNetwork]

export default function useNetwork() {
    // The selected network
    const [network, setNetwork] = useState(null as INetwork | null)

    const [loading, setLoading] = useState(true)

    // BEGIN TODO: network
    // Handle when the user changes the network
    const changeNetwork = useCallback(async (chainId: string) => {
        // ...
    }, [])

    // Register the event to recognize when the user changed the network
    useEffect(() => {
        // ...
    }, [changeNetwork])

    // Initialize the network
    const initializeNetwork = useCallback(async () => {
        setLoading(true)

        // ...
    }, [changeNetwork])
    // END TODO: network

    // First initialize the network
    useEffect(() => {
        initializeNetwork()
    }, [initializeNetwork])

    return [network, loading] as const
}
