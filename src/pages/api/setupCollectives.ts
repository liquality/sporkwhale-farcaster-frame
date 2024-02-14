import { NextApiRequest, NextApiResponse } from 'next'
import * as database from '@/utils/database-operations'
import { createCollective, createPool } from '@/utils/contract-operations'
import {SUPPORTED_CHANNELS } from '../../utils/constants'

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
 if(request.method == 'GET') {
    try {

    for (const channel in SUPPORTED_CHANNELS) {

        // Deploy a new collective and pool for each channel
        const cMetadata = await createCollective()
        const cPool = await createPool(cMetadata.address)
        console.log('Collective created:', cMetadata.address)
        console.log('Pool created:', cPool)

        database.createChannel(channel, 1, cMetadata.address, cMetadata.wallet, cPool, cMetadata.salt)
    }

    return response.status(200).json({status: 'Ok', message: 'Collectives created successfully'})

  } catch (error) {
    console.error('Error creating collectives:', error)
    return response.status(500).json({ error })
  }
 }
}