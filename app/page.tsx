'use client'

import { useState } from 'react'
import { ethers } from 'ethers'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CopyIcon, RefreshCwIcon } from 'lucide-react'

export default function EthereumAddressGenerator() {
  const [wallet, setWallet] = useState<{
    address: string;
    mnemonic: string;
    privateKey: string;
  } | null>(null)

  const generateWallet = () => {
    const newWallet = ethers.Wallet.createRandom()
    setWallet({
      address: newWallet.address,
      mnemonic: newWallet.mnemonic?.phrase || 'Unable to generate mnemonic',
      privateKey: newWallet.privateKey,
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="container mx-auto p-4 flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-lg">Create DaVinci Address</CardTitle>
          <CardDescription className="text-center">Generate a new Ethereum address, mnemonic, and private key</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={generateWallet} className="w-full">
            <RefreshCwIcon className="mr-2 h-4 w-4" />
            Generate New Wallet
          </Button>
          {wallet && (
            <>
              <div>
                <Label htmlFor="address">Address</Label>
                <div className="flex mt-1">
                  <Input id="address" value={wallet.address} readOnly />
                  <Button variant="outline" className="ml-2" onClick={() => copyToClipboard(wallet.address)}>
                    <CopyIcon className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Your Ethereum address. Use this to receive funds.
                </p>
              </div>
              <div>
                <Label htmlFor="mnemonic">Mnemonic</Label>
                <div className="flex mt-1">
                  <Input id="mnemonic" value={wallet.mnemonic} readOnly />
                  <Button variant="outline" className="ml-2" onClick={() => copyToClipboard(wallet.mnemonic)}>
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
                  <Button variant="outline" className="ml-2" onClick={() => copyToClipboard(wallet.privateKey)}>
                    <CopyIcon className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Your private key. Never share this with anyone!
                </p>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-center">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Important Notice</CardTitle>
          </CardHeader>
          <p className="text-sm text-muted-foreground text-center">
            Note: This tool generates DaVinci addresses for real use. For maximum security, consider using hardware wallets or other secure methods.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

