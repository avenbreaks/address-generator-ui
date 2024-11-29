'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CopyIcon, RefreshCwIcon, SendIcon, DownloadIcon, WalletIcon } from 'lucide-react'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { QRCodeSVG } from 'qrcode.react'

const SYNC_INTERVAL = 10000 // 10 seconds

export default function DaVinciWallet() {
  const [wallet, setWallet] = useState<{
    address: string;
    mnemonic: string;
    privateKey: string;
  } | null>(null)
  const [connectedWallet, setConnectedWallet] = useState<ethers.Wallet | null>(null)
  const [balance, setBalance] = useState<string>('0')
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [showQR, setShowQR] = useState(false)
  const [latestBlock, setLatestBlock] = useState<number | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)

  const provider = new ethers.JsonRpcProvider('https://rpc.davinci.bz')

  const generateWallet = () => {
    const newWallet = ethers.Wallet.createRandom()
    setWallet({
      address: newWallet.address,
      mnemonic: newWallet.mnemonic?.phrase || 'Unable to generate mnemonic',
      privateKey: newWallet.privateKey,
    })
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    console.log(`${type} has been copied to clipboard.`)
  }

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        await window.ethereum.request({ method: 'eth_requestAccounts' })
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const address = await signer.getAddress()
        setConnectedWallet(signer as unknown as ethers.Wallet)
        console.log("Wallet Connected", `Connected to ${address}`)
        updateBalance(address)
      } else {
        console.log("Error", "MetaMask is not installed")
      }
    } catch (error: any) {
      console.log("Error", "Failed to connect wallet", error)
    }
  }

  const updateBalance = async (address: string) => {
    const balance = await provider.getBalance(address)
    setBalance(ethers.formatEther(balance))
  }

  const sendToken = async () => {
    if (!connectedWallet) {
      console.log("Error", "Please connect your wallet first")
      return
    }

    try {
      const tx = await connectedWallet.sendTransaction({
        to: recipient,
        value: ethers.parseEther(amount)
      })
      await tx.wait()
      console.log("Success", `Sent ${amount} DCOIN to ${recipient}`)
      updateBalance(await connectedWallet.getAddress())
    } catch (error: any) {
      console.log("Error", "Failed to send tokens", error)
    }
  }

  const fetchLatestBlock = async () => {
    try {
      setIsSyncing(true)
      const blockNumber = await provider.getBlockNumber()
      setLatestBlock(blockNumber)
      setIsSyncing(false)
    } catch (error: any) {
      console.error("Failed to fetch latest block:", error)
      setIsSyncing(false)
    }
  }

  useEffect(() => {
    fetchLatestBlock()
    const interval = setInterval(fetchLatestBlock, SYNC_INTERVAL)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (connectedWallet) {
      updateBalance(connectedWallet.address)
    }
  }, [connectedWallet])

  return (
    <div className="container mx-auto p-4 flex justify-center items-center min-h-screen relative">
      <Card className="w-full max-w-2xl mx-auto">
        <div className="flex justify-between items-center p-4">
          <CardTitle className="text-2xl font-bold">DaVinci Wallet</CardTitle>
          <Button onClick={connectWallet} variant="outline" className="ml-auto">
            <WalletIcon className="mr-2 h-4 w-4" />
            Connect Wallet
          </Button>
        </div>
        <CardHeader>
          <CardDescription>Generate, connect, and manage your DaVinci wallet</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Button onClick={generateWallet} className="flex-1">
              <RefreshCwIcon className="mr-2 h-4 w-4" />
              Generate New Wallet
            </Button>
          </div>
          {wallet && (
            <>
              <div>
                <Label htmlFor="address">Address</Label>
                <div className="flex mt-1">
                  <Input id="address" value={wallet.address} readOnly />
                  <Button variant="outline" className="ml-2" onClick={() => copyToClipboard(wallet.address, "Address")}>
                    <CopyIcon className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Your DaVinci address. Use this to receive funds.
                </p>
              </div>
              <div>
                <Label htmlFor="mnemonic">Mnemonic</Label>
                <div className="flex mt-1">
                  <Input id="mnemonic" value={wallet.mnemonic} readOnly />
                  <Button variant="outline" className="ml-2" onClick={() => copyToClipboard(wallet.mnemonic, "Mnemonic")}>
                    <CopyIcon className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  A 12-word phrase used to recover your wallet. Keep this secret and safe!
                </p>
              </div>
              <div>
                <Label htmlFor="privateKey">Private Key</Label>
                <div className="flex mt-1">
                  <Input id="privateKey" value={wallet.privateKey} readOnly />
                  <Button variant="outline" className="ml-2" onClick={() => copyToClipboard(wallet.privateKey, "Private Key")}>
                    <CopyIcon className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Your private key. Never share this with anyone!
                </p>
              </div>
            </>
          )}
          <div className="flex space-x-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="flex-1">
                  <SendIcon className="mr-2 h-4 w-4" />
                  Send Token
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Send DCOIN</DialogTitle>
                  <DialogDescription>Enter the recipient address and amount to send DCOIN.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="recipient">Recipient Address</Label>
                    <Input id="recipient" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="0x..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (DCOIN)</Label>
                    <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.0" />
                  </div>
                  <Button onClick={sendToken} className="w-full">Send</Button>
                </div>
              </DialogContent>
            </Dialog>
            <div className="flex-1 flex flex-col items-center">
              <Button 
                className="w-full mb-2" 
                onClick={() => {
                  if (connectedWallet) {
                    setShowQR(!showQR);
                  } else {
                    console.log("Please connect your wallet first");
                  }
                }}
              >
                <DownloadIcon className="mr-2 h-4 w-4" />
                {showQR ? 'Hide' : 'Show'} Receive QR
              </Button>
              {showQR && connectedWallet && (
                <div className="mt-2 p-2 bg-white rounded-lg flex flex-col items-center justify-center w-full">
                  <QRCodeSVG value={connectedWallet.address} size={128} />
                  <p className="mt-2 text-xs text-center overflow-hidden text-ellipsis w-full" style={{ whiteSpace: 'nowrap' }}>{connectedWallet.address}</p>
                </div>
              )}
            </div>
          </div>
          {connectedWallet && (
            <div className="mt-4 text-center">
              <Label>Connected Wallet Balance</Label>
              <p className="text-lg font-bold">{balance} DCOIN</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-center">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Important Notice</CardTitle>
          </CardHeader>
          <p className="text-sm text-muted-foreground text-center">
            Note: This wallet interacts with the DaVinci Protocol (ChainId: 293). Always verify transactions before confirming.
          </p>
        </CardFooter>
      </Card>
      <div className="absolute bottom-4 right-4">
        <Card className="w-64">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${isSyncing ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium">
                {isSyncing ? 'Syncing' : 'Not Syncing'}
              </span>
            </div>
            <span className="text-sm">
              Block: {latestBlock !== null ? latestBlock : 'N/A'}
            </span>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

