'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  fetchAllPolls,
  getCounter,
  getProvider,
  getReadonlyProvider,
  initialize,
} from '@/services/blockchain.service'
import { Poll } from '@/utils/interfaces'
import { BN } from '@coral-xyz/anchor'
import { useWallet } from '@solana/wallet-adapter-react'
import { toast } from 'react-toastify'
import { ExploreSection } from '@/components/explore-section'

export default function Page() {
  const [polls, setPolls] = useState<Poll[]>([])
  const { publicKey, signTransaction, sendTransaction } = useWallet()
  const [isInitialized, setIsInitialized] = useState<boolean>(false)
  const programReadOnly = useMemo(() => getReadonlyProvider(), [])

  const program = useMemo(
    () => getProvider(publicKey, signTransaction, sendTransaction),
    [publicKey, signTransaction, sendTransaction]
  )

  const fetchData = async () => {
    fetchAllPolls(programReadOnly).then((data) => setPolls(data as any))
    const count = await getCounter(programReadOnly)
    setIsInitialized(count.total.gte(new BN(0)))
  }

  useEffect(() => {
    if (!programReadOnly) return
    fetchData()
  }, [programReadOnly])

  const handleInit = async () => {
    if (isInitialized && !!publicKey) return
    await toast.promise(
      new Promise<void>(async (resolve, reject) => {
        try {
          const tx = await initialize(program!, publicKey!)
          console.log(tx)

          await fetchData()
          resolve(tx as any)
        } catch (error) {
          console.error('Transaction failed:', error)
          reject(error)
        }
      }),
      {
        pending: 'Approve transaction...',
        success: 'Transaction successful 👌',
        error: 'Encountered error 🤯',
      }
    )
  }
  return (
    <div className='flex flex-col items-center justify-center w-full min-h-screen bg-white'>
      {!publicKey&& (
        <>
          <p className="text-gray-600 text-xl">Please connect your wallet to use this app.</p>
        </>
      )}
      {isInitialized && polls.length < 1 && (
        <>
          <p className="text-gray-600 text-xl">We don&apos;t have any polls yet, be the first to create one.</p>
        </>
      )}

      {!isInitialized && publicKey && (
        <button
        onClick={handleInit}
        className=" p-4 brutalist-button font-mono font-bold uppercase border-2 border-black shadow-brutal bg-gray-300 text-black"
        >
          Initialize
        </button>
      )}
    
      {isInitialized && polls.length > 0 && <ExploreSection polls={polls} />}
    </div>
  )
}
