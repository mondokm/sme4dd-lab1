import { useCallback, useEffect, useState } from 'react'
import { Address } from 'viem'

export default function useNavigation() {
    // The page to display
    const [page, setPage] = useState('home' as 'home' | Address)

    // Navigate to the correct page on load
    useEffect(() => {
        const url = window.location.pathname
        if (url.startsWith('/0x')) {
            setPage(url.substring(1) as Address)
        } else {
            setPage('home')
        }

        window.addEventListener('popstate', (e) => {
            if (e.state) {
                setPage(e.state)
            } else {
                const url = window.location.pathname
                if (url.startsWith('/0x')) {
                    setPage(url.substring(1) as Address)
                } else {
                    setPage('home')
                }
            }
        })
    }, [])

    // Navigate to another page
    const navigate = useCallback(
        (newPage: Address | 'home') => {
            if (page !== newPage) {
                window.history.pushState(newPage, '', newPage === 'home' ? '/' : `/${newPage}`)
                setPage(newPage)
            }
        },
        [page]
    )

    // Set the title
    useEffect(() => {
        if (page === 'home') {
            document.title = 'Home - Blind Auction'
        } else {
            document.title = `${page} - Blind Auction`
        }
    }, [page])

    return [page, navigate] as const
}
