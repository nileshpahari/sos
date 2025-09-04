import React, { useMemo, useState } from 'react'
import { FaTimes } from 'react-icons/fa'
import { globalActions } from '@/store/globalSlices'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/utils/interfaces'
import {
  fetchAllCandidates,
  fetchPollDetails,
  getProvider,
  registerCandidate,
} from '@/services/blockchain.service'
import { useWallet } from '@solana/wallet-adapter-react'
import { toast } from 'react-toastify'

const RegCandidate = ({
  pollId,
  pollAddress,
}: {
  pollId: number
  pollAddress: string
}) => {
  const { publicKey, sendTransaction, signTransaction } = useWallet()
  const [candidateName, setCandidateName] = useState<string>('')

  const dispatch = useDispatch()
  const { setRegModal } = globalActions
  const { regModal } = useSelector((states: RootState) => states.globalStates)

  const program = useMemo(
    () => getProvider(publicKey, signTransaction, sendTransaction),
    [publicKey, signTransaction, sendTransaction]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!program || !publicKey || !candidateName) return

    await toast.promise(
      new Promise<void>(async (resolve, reject) => {
        try {
          const tx = await registerCandidate(
            program!,
            publicKey!,
            pollId,
            candidateName
          )

          setCandidateName('')
          dispatch(setRegModal('scale-0'))

          await fetchPollDetails(program, pollAddress)
          await fetchAllCandidates(program, pollAddress)

          console.log(tx)
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
    <div
      className={`fixed top-0 left-0 w-screen h-screen flex items-center justify-center
      bg-black bg-opacity-50 transform z-[3000] transition-transform duration-300 ${regModal}`}
    >
      <div className="bg-white border-2 border-black shadow-[6px_6px_0_0_#000] rounded-none w-11/12 md:w-2/5 p-6">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex flex-row justify-between items-center">
            <p className="block text-base font-bold text-black uppercase">
              Candidate Name
            </p>
            <button
              type="button"
              className="border-2 border-black p-2 bg-gray-100 hover:bg-gray-200 shadow-[2px_2px_0_0_#000] rounded-none"
              onClick={() => dispatch(setRegModal('scale-0'))}
            >
              <FaTimes className="text-black" />
            </button>
          </div>

          {/* Input */}
          <div>
            <input
              type="text"
              id="description"
              placeholder="Enter candidate name..."
              required
              className="mt-2 block w-full py-3 px-4 border-2 border-black
              rounded-none shadow-[2px_2px_0_0_#000] focus:ring-0
              focus:outline-none bg-gray-50 text-black font-mono"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
            />
          </div>

          {/* Submit */}
          <div className="flex justify-center w-full">
            <button
              type="submit"
              disabled={!program || !publicKey}
              className="bg-yellow-300 text-black font-bold py-3 px-6 rounded-none
              border-2 border-black shadow-[3px_3px_0_0_#000] hover:bg-yellow-400
              transition duration-200 w-full disabled:opacity-60"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RegCandidate
