import type { NextApiRequest, NextApiResponse, Metadata } from 'next'

import { mintWithSyndicate } from '@/utils/utils'
import { validateMessage } from '@/validate'
import { TSignedMessage, TUntrustedData } from '@/types'
import { generateFarcasterFrame, SERVER_URL } from '@/utils/generate-frames'

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
  console.log('request query: ', reqId)

  const isMessageValid = await validateMessage(
    signedMessage.trustedData?.messageBytes
  )

  console.log('signedMessage: ', signedMessage)

  if (!isMessageValid) {
    return res.status(400).json({ error: 'Invalid message' })
  }

  const ud: TUntrustedData = signedMessage.untrustedData

  let html: string = ''
  let statusCode: number = 200
  let locationHeader: string = ''
  const response = res.status(statusCode).setHeader('Content-Type', 'text/html')

  switch (reqId) {
    case 'start':
      if (ud.inputText && ud.inputText.length > 0) {
        // html = await saveTextInput(ud)
        html = generateFarcasterFrame(`${SERVER_URL}/mint.png`, 'mint')
      } else {
        html = generateFarcasterFrame(`${SERVER_URL}/johannas_lastname_question1.png`, 'start')
      }
      break
    case 'mint':
      html = await mintWithSyndicate(ud.fid)
      break
    case 'redirect':
      locationHeader = 'https://www.liquality.io'
      response.redirect(302, locationHeader) // or you set Location in response.setHeader()
      break
    case 'error':
      locationHeader = 'https://warpcast.com/~/channel/frames'
      response.redirect(302, locationHeader)
      break
    default:
      html = generateFarcasterFrame(`${SERVER_URL}/johannas_lastname_question1.png`, 'start')
      break
  }

  return response.send(html)
}
