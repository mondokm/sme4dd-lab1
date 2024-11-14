import { Address } from 'viem'
import { useMemo, useState } from 'react'
import Loading from '../common/Loading'
import { Message } from 'primereact/message'
import { DataView } from 'primereact/dataview'
import { Button } from 'primereact/button'
import NewAuctionDialog from './NewAuctionDialog'
import { classNames } from 'primereact/utils'
import ImportAuctionDialog from './ImportAuctionDialog'
import { Card } from 'primereact/card'
import useNetwork from '../../hooks/useNetwork'
import useClient from '../../hooks/useClient'
import useAuctionFactory from '../../hooks/useAuctionFactory'
import useAuctionStore from '../../hooks/useAuctionStore'

enum AuctionHomeState {
    LOADING,
    LOADED,
    FAILED
}

type Props = {
    navigate: (address: Address) => void
}

function AuctionHome({ navigate }: Props) {
    const [network] = useNetwork()
    const [client] = useClient()

    const [factoryContract] = useAuctionFactory()
    const [auctions, addAuction, removeAuction] = useAuctionStore()

    const state = useMemo(() => {
        if (!network || !client) {
            return AuctionHomeState.LOADING
        } else if (!factoryContract) {
            return AuctionHomeState.FAILED
        } else {
            return AuctionHomeState.LOADED
        }
    }, [network, client, factoryContract])

    const [showNewAuctionDialog, setShowNewAuctionDialog] = useState(false)
    const [showImportAuctionDialog, setShowImportAuctionDialog] = useState(false)

    const itemTemplate = (address: Address, index: number) => {
        return (
            <div
                className="flex flex-row justify-content-start align-items-center py-3 px-2 w-full hover:surface-ground"
                key={index}
            >
                <span>{address}</span>
                <div className="flex-grow-1 justify-content-end align-items-center flex gap-2">
                    <Button
                        icon="pi pi-trash"
                        size="small"
                        rounded
                        severity="danger"
                        aria-label="delete"
                        pt={{ root: { className: classNames('p-1', 'w-2rem', 'h-2rem') } }}
                        onClick={() => removeAuction(address)}
                    />
                    <Button
                        icon="pi pi-angle-right"
                        size="small"
                        rounded
                        severity="secondary"
                        aria-label="Open"
                        pt={{ root: { className: classNames('p-1', 'w-2rem', 'h-2rem') } }}
                        onClick={() => navigate(address)}
                    />
                </div>
            </div>
        )
    }

    const listTemplate = (addresses: Address[]) => {
        if (!addresses || addresses.length === 0) return null

        const list = addresses.map((address, index) => {
            return itemTemplate(address, index)
        })

        return <div className="grid grid-nogutter">{list}</div>
    }

    return (
        <>
            {state === AuctionHomeState.LOADING && <Loading />}
            {state === AuctionHomeState.FAILED && (
                <Message severity="error" text="Factory contract is not deployed on this network!" className="w-full" />
            )}
            {state === AuctionHomeState.LOADED && (
                <Card title="Auctions">
                    <div className="flex justify-content-start align-items-center gap-2 mb-2">
                        <Button
                            icon="pi pi-plus"
                            size="small"
                            label="New auction"
                            severity="success"
                            onClick={() => setShowNewAuctionDialog(true)}
                        />
                        <Button
                            icon="pi pi-download"
                            size="small"
                            label="Import auction"
                            severity="info"
                            onClick={() => setShowImportAuctionDialog(true)}
                        />
                    </div>
                    <DataView
                        value={auctions}
                        listTemplate={listTemplate}
                        pt={{
                            header: { className: classNames('bg-white') },
                            paginator: { root: { className: classNames('border-none') } }
                        }}
                    />
                </Card>
            )}
            {network && client && (
                <>
                    {factoryContract && (
                        <NewAuctionDialog
                            show={showNewAuctionDialog}
                            onCancel={() => setShowNewAuctionDialog(false)}
                            onNewAuction={(auction) => {
                                addAuction(auction)
                                setShowNewAuctionDialog(false)
                            }}
                        />
                    )}
                    <ImportAuctionDialog
                        show={showImportAuctionDialog}
                        onCancel={() => setShowImportAuctionDialog(false)}
                        onNewAuction={(auction) => {
                            addAuction(auction)
                            setShowImportAuctionDialog(false)
                        }}
                    />
                </>
            )}
        </>
    )
}

export default AuctionHome
