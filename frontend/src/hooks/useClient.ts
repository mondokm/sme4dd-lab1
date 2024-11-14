import { useState, useCallback, useEffect } from 'react'
import { WalletClient, Address, createWalletClient, custom, Transport, Chain, Account, RpcSchema } from 'viem'
import useNetwork from './useNetwork'

export default function useClient() {
    // Viem Client
    const [client, setClient] = useState(null as WalletClient<Transport, Chain, Account, RpcSchema> | null)

    const [loading, setLoading] = useState(true)

    const [network] = useNetwork()

    // BEGIN TODO: user
    // Handle when the user changes the account
    const changeUser = useCallback(
        async ([userAddress]: (Address | undefined)[]) => {
            // ...
        },
        [network]
    )

    // Register the event to recognize when the user changed the wallet
    useEffect(() => {
        // ...
    }, [changeUser])

    const initializeUser = useCallback(async () => {
        setLoading(true)
        // ...
    }, [changeUser])
    // END TODO: user

    // Reinitialize the user if the network changes
    useEffect(() => {
        initializeUser()
    }, [initializeUser, network])

    return [client, loading] as const
}
