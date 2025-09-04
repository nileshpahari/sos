import { Connection, PublicKey } from '@solana/web3.js'
import { getReadonlyProvider } from '@/services/blockchain.service'
import idl from '@/idl/votana.json'

export const EXPECTED_PROGRAM_ID = '2puwiuoe4Yrn8nK8kZ8jDqwPApAGKLM7nR5NtnW5Lwap'

export interface ConnectionStatus {
  rpcUrl: string
  programId: string
  isConnected: boolean
  programExists: boolean
  error?: string
  networkType: 'localnet' | 'devnet' | 'mainnet' | 'unknown'
}

export async function verifyContractConnection(): Promise<ConnectionStatus> {
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'http://127.0.0.1:8899'
  const programId = idl.address
  
  // Determine network type
  let networkType: 'localnet' | 'devnet' | 'mainnet' | 'unknown' = 'unknown'
  if (rpcUrl.includes('127.0.0.1') || rpcUrl.includes('localhost')) {
    networkType = 'localnet'
  } else if (rpcUrl.includes('devnet')) {
    networkType = 'devnet'
  } else if (rpcUrl.includes('mainnet')) {
    networkType = 'mainnet'
  }

  try {
    // Create connection
    const connection = new Connection(rpcUrl, 'confirmed')
    
    // Check if program exists on this network
    const programAccount = await connection.getAccountInfo(new PublicKey(programId))
    const programExists = programAccount !== null

    if (!programExists) {
      return {
        rpcUrl,
        programId,
        isConnected: false,
        programExists: false,
        error: `Program ${programId} not found on ${networkType}`,
        networkType
      }
    }

    // Try to get the program and test a simple operation
    try {
      const program = getReadonlyProvider()
      
      // Try to fetch counter account (this will fail if program doesn't exist)
      const [counterPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('counter')],
        new PublicKey(programId)
      )
      
      await program.account.counter.fetch(counterPDA)
      
      return {
        rpcUrl,
        programId,
        isConnected: true,
        programExists: true,
        networkType
      }
    } catch (accountError) {
      // Program exists but account might not be initialized yet
      return {
        rpcUrl,
        programId,
        isConnected: true,
        programExists: true,
        error: 'Program found but counter account not initialized yet',
        networkType
      }
    }
    
  } catch (error) {
    return {
      rpcUrl,
      programId,
      isConnected: false,
      programExists: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      networkType
    }
  }
}

export function logConnectionInfo() {
  console.log('=== Contract Connection Info ===')
  console.log('Expected Program ID:', EXPECTED_PROGRAM_ID)
  console.log('Current RPC URL:', process.env.NEXT_PUBLIC_RPC_URL || 'http://127.0.0.1:8899')
  console.log('IDL Program ID:', idl.address)
  console.log('Program IDs match:', EXPECTED_PROGRAM_ID === idl.address)
  console.log('===============================')
}

// Call this in your browser console to check connection
export async function checkConnectionInConsole() {
  const status = await verifyContractConnection()
  console.log('Connection Status:', status)
  return status
}
