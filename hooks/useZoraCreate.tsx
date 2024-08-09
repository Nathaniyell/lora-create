'use client'

import { useAccount, usePublicClient } from 'wagmi'
import { useWriteContracts } from 'wagmi/experimental'
import { createCreatorClient } from '@zoralabs/protocol-sdk'
import { CHAIN_ID, REFERRAL_RECIPIENT } from '@/lib/consts'
import { usePaymasterProvider } from '@/providers/PaymasterProvider'
import useCreateSuccessRedirect from './useCreateSuccessRedirect'

const useZoraCreate = () => {
  const publicClient = usePublicClient()!
  const { address } = useAccount()
  const { capabilities } = usePaymasterProvider()
  const { data: callsStatusId, writeContractsAsync } = useWriteContracts()
  useCreateSuccessRedirect(callsStatusId)

  const create = async () => {
    try {
      const creatorClient = createCreatorClient({ chainId: CHAIN_ID, publicClient })
      const cc0MusicIpfsHash = 'ipfs://bafkreiazqdg6qc3j6yjcxyhvoyaspmjjwal5wvywjs66jobb3pbzknvzxu'
      const { parameters } = await creatorClient.create1155({
        contract: {
          name: 'CC0 Music',
          uri: cc0MusicIpfsHash,
        },
        token: {
          tokenMetadataURI: cc0MusicIpfsHash,
          createReferral: REFERRAL_RECIPIENT,
          salesConfig: {
            erc20Name: 'CC0 Music',
            erc20Symbol: 'CC0',
          },
        },
        account: address!,
      })
      const newParameters = { ...parameters, functionName: 'createContract' }
      const tx = await writeContractsAsync({
        contracts: [{ ...(newParameters as any) }],
        capabilities,
      } as any)
      console.log('SWEETS tx', tx)
    } catch (err) {
      console.error(err)
    }
  }

  return { create }
}

export default useZoraCreate
