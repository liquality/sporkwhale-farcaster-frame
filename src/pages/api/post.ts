import type { NextApiRequest, NextApiResponse, Metadata } from 'next'

import { IMAGES, mintWithSyndicate } from '@/utils/utils'
import { validateMessage } from '@/validate'
import { TSignedMessage, TUntrustedData } from '@/types'
import { generateFarcasterFrame, SERVER_URL } from '@/utils/generate-frames'
import {  saveUser, saveUserQuestionResponse } from '@/utils/database-operations'
import { getChannelFromCastHash } from '@/utils/neynar-api'


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

  console.log('signedMessage: ', signedMessage, isMessageValid)

/*   if (!isMessageValid) {
    console.log(isMessageValid, 'message is invalid')
    return res.status(400).json({ error: 'Invalid message' })
  } */
  const ud: TUntrustedData = signedMessage.untrustedData

  let html: string = ''
  let statusCode: number = 200
  let locationHeader: string = ''
  let response: any
  const questionCorrectAnswer = "fransson"


  response = res.status(statusCode).setHeader('Content-Type', 'text/html')


  //TODO: generate inital frame based on calculation of participation/correctness
  //TODO add check here so that user is indeed in the channel, since its channel-gated poll
  //let channel = await getChannelFromCastHash(ud.castId.hash)
  let channel = ""
  if(!channel) channel = "no channel"
  console.log(ud, 'WHAT IS UD?')

  switch (reqId) {
    case 'start':
      html = generateFarcasterFrame(`${SERVER_URL}/${IMAGES.question1}`, 'question')
      break
    case 'question':
      console.log('Should go here!')
      console.log(ud, 'WHAT IS UD?')
      if(channel && ud.inputText && ud.inputText.length){
        const user = await saveUser(ud, channel)
        const correctResponse = ud.inputText && ud.inputText.toLowerCase() === questionCorrectAnswer
        html = await saveUserQuestionResponse(ud, user.user_id, correctResponse as boolean)
      }
      else {
        html = generateFarcasterFrame(`${SERVER_URL}/${IMAGES.whale}`, 'question')
      }
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
      html = generateFarcasterFrame(`${SERVER_URL}/${IMAGES.question1}`, 'start')
      break
  }

  console.log(html, 'wats html?')

  return response.send(html)
}
