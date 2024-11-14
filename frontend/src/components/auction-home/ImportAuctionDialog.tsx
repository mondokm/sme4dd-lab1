import { Address, getAddress, getContract } from 'viem'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { useCallback, useEffect, useState } from 'react'
import { BlindAuction } from '../../contracts/BlindAuction'
import { Message } from 'primereact/message'
import useClient from '../../hooks/useClient'

type Props = {
    show: boolean
    onCancel: () => void
    onNewAuction: (address: Address) => void
}

function ImportAuctionDialog({ show, onCancel, onNewAuction }: Props) {
    const [client] = useClient()

    const [auctionAddress, setAuctionAddress] = useState('' as Address)

    const [errorMessage, setErrorMessage] = useState(null as string | null)

    useEffect(() => {
        setAuctionAddress('' as Address)
        setErrorMessage('')
    }, [show])

    const importAuction = useCallback(async () => {
        if (!client) {
            return
        }

        setErrorMessage(null)
        try {
            getContract({
                abi: BlindAuction.abi,
                client: client,
                address: getAddress(auctionAddress)
            })

            onNewAuction(auctionAddress)
        } catch (err) {
            setErrorMessage('There is no auction contract at the supplied address')
        }
    }, [auctionAddress, client, onNewAuction])

    return (
        <Dialog
            header="Import auction"
            footer={
                <div>
                    <Button text size="small" severity="secondary" label="Cancel" onClick={onCancel} />
                    <Button
                        size="small"
                        severity="info"
                        icon="pi pi-download"
                        label="Import auction"
                        onClick={() => importAuction()}
                    />
                </div>
            }
            visible={show}
            onHide={onCancel}
            style={{ maxWidth: '800px' }}
            className="w-full"
        >
            <div className="formgrid grid">
                <div className="field col-12">
                    <label htmlFor="auctionAddress">Auction address</label>
                    <InputText
                        id="auctionAddress"
                        className="w-full"
                        value={auctionAddress}
                        onChange={(e) => setAuctionAddress(e.target.value as Address)}
                    />
                </div>
            </div>
            {errorMessage && (
                <Message
                    severity="error"
                    icon={
                        <>
                            <span className="pi pi-exclamation-triangle" />
                            &nbsp;
                        </>
                    }
                    text={`Error: ${errorMessage}`}
                    className="w-full"
                />
            )}
        </Dialog>
    )
}

export default ImportAuctionDialog
