import type { NextApiRequest, NextApiResponse } from 'next'
import { IMAGES } from '@/utils/image-paths'
import { validateMsgWithNeynar } from '@/validate'
import { TSignedMessage, TUntrustedData } from '@/types'
import { generateFarcasterFrame, SERVER_URL } from '@/utils/generate-frames'
import {
  calculateIfWinningOrNot,
  checkIfAvailableForMintAndMint,
  getChannel,
  getQuestionFromId,
} from '@/utils/database-operations'
import { HANDLE_QUESTION } from '@/utils/question'
import { mintSporkNFT } from '@/utils/contract-operations'
import { getChannelFromCastHash } from '@/utils/neynar-api'
import { channel } from 'diagnostics_channel'

const QUESTION_ID = parseInt(process.env.QUESTION_ID || '')

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  const signedMessage = req.body as TSignedMessage

  const reqId = req.query.data
  console.log('request query IN MINT: ', reqId)

  const isMessageValid = await validateMsgWithNeynar(
    signedMessage.trustedData?.messageBytes
  )

  if (!isMessageValid) {
    return res.status(400).json({ error: 'Invalid message' })
  }

  const ud: TUntrustedData = signedMessage.untrustedData

  let html: string = ''
  let statusCode: number = 200
  let locationHeader: string = ''
  //let userIsInChannel: TUserProfileNeynar | null | undefined = null
  let castHash = ud.castId.hash
  //let castHash = '0x75fb5866c3105e82500406c94d0f295af4a74d32'
  //let castHash = '0x4c9595bba3cc8f6490d7cc67265aa6a3938c1afb' //BASE
  //let castHash = '0x5bca5665d444b7ece7bddf7bb16cc627dd7d324a' //farcasther
  //let castHash = '0x03475d45887f13c592c44829de3de18a7d95619d' //farcasther
  //let castHash = '0x7aadf31bcdd0adfe41e593c5bc6c32bb81118471' //cryptostocks cast
  let channel = await getChannelFromCastHash(castHash)
  const response = res.status(statusCode).setHeader('Content-Type', 'text/html')

  console.log(`${SERVER_URL}/${IMAGES.mint}`, 'beeee')
  switch (reqId) {
    case 'start-mint':
      if (channel) {
        const channelDb = await getChannel(channel)

        html = generateFarcasterFrame(
          `${SERVER_URL}/${channelDb.question_id + '_mint.png'}`,
          'mint'
        )
      }

      break
    case 'mint':
      if (QUESTION_ID && channel) {
        console.log('Not in mint start question')

        console.log('MINTING THE MINT')
        html = await checkIfAvailableForMintAndMint(ud.fid, channel)
      } else {
        html = generateFarcasterFrame(
          `${SERVER_URL}/${IMAGES.expired}`,
          'follow-liquality'
        )
      }
      break

    case 'follow-liquality':
      locationHeader = `https://warpcast.com/liquality`
      return response.redirect(302, locationHeader)

    default:
      html = generateFarcasterFrame(
        `${SERVER_URL}/${IMAGES.start_mint}`,
        'start-mint'
      )
      break
  }

  console.log(html, 'wat is html? XXXX')
  return response.send(html)
}
