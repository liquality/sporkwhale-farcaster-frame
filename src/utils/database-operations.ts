import { sql } from '@vercel/postgres'
import { generateFarcasterFrame, SERVER_URL } from './generate-frames'
import { TUntrustedData } from '../types'
import { getAddrByFid } from './farcaster-api'
import { IMAGES, levelImages } from './image-paths'
export const QUESTION_ID = 3

export async function saveUserQuestionResponse(
  ud: TUntrustedData,
  userId: number,
  correctResponse: boolean
) {
  //-----  WHEN TESTING COMMENT OUT THE DB SAVE QUESTION RESPONSE FOR NOW ----------------

  const existingQuestionResponse =
    await sql`SELECT * FROM "user_question_responses" WHERE user_id = ${userId}`

  if (existingQuestionResponse.rowCount > 0) {
    console.log('Feedback already submitted by fid:', ud.fid)
    return generateFarcasterFrame(
      `${SERVER_URL}/${IMAGES.already_submitted}`,
      'error'
    )
  } else {
    await sql`INSERT INTO "user_question_responses" (question_id, user_id, correct_response, response) VALUES (${QUESTION_ID}, ${userId}, ${correctResponse}, ${ud.inputText});`
    if (correctResponse) {
      console.log('Got into correctresponse!')

      return generateFarcasterFrame(
        `${SERVER_URL}/${IMAGES.correct_response}`,
        'redirect'
      )
    } else {
      console.log('Got into wrong response!')

      return generateFarcasterFrame(
        `${SERVER_URL}/${IMAGES.wrong_response}`,
        'redirect'
      )
    }
  }
}

export async function saveUser(ud: TUntrustedData, channelName: string) {
  const channel = await getChannel(channelName)
  //If the user does not exist in db and this channel, create a new one
  const existingUser = await sql`SELECT * FROM users WHERE fid = ${ud.fid}`
  const walletAddress = await getAddrByFid(ud.fid)
  if (!existingUser.rowCount && walletAddress) {
    await sql`INSERT INTO users (fid, wallet_address) VALUES (${ud.fid}, ${walletAddress});`
    const selectedNewUser = await sql`SELECT * FROM users WHERE fid = ${ud.fid}`
    return selectedNewUser.rows[0]
  } else return existingUser.rows[0]
}

export async function getChannel(channel: string) {
  const existingChannel =
    await sql`SELECT * FROM channels WHERE name = ${channel}`
  return existingChannel.rows[0]
}

//TODO change this to 'over 30% of the channel (get total user length from neynar in a particular channel)
export async function calculateImageBasedOnChannelResponses(
  channelName: string
) {
  try {
    const channel = await getChannel(channelName)
    const channelFollowerCount = channel.followers

    let newTrait = ''
    // Fetch current level of the channel from the database
    const currentLevelQuery =
      await sql`SELECT trait FROM trait_displayed WHERE channel_id = ${channel.id}`
    const currentTrait = currentLevelQuery.rows[0].trait

    // Determine the current level index based on the image path
    const currentLevel = Object.values(levelImages).indexOf(currentTrait)

    // Fetch total count of users in the specific channel
    const totalUsersQuery =
      await sql`SELECT COUNT(*) AS total_users FROM user_question_responses WHERE channel_id = ${channel.id}`
    const totalUsersCount = totalUsersQuery.rows[0].total_users

    // Fetch count of correct responses in the specific channel
    const correctResponsesQuery =
      await sql`SELECT COUNT(*) AS correct_responses FROM user_question_responses WHERE channel_id = ${channel.id} AND correct_response = TRUE`
    const correctResponsesCount =
      correctResponsesQuery.rows[0].correct_responses

    console.log(correctResponsesCount, 'correct responses count')
    console.log(
      channelFollowerCount,
      'channelfollowercount and totaluserscount:',
      totalUsersCount
    )
    // Calculate response percentages
    const respondingPercentage = (totalUsersCount / channelFollowerCount) * 100
    const correctPercentage = (correctResponsesCount / totalUsersCount) * 100

    console.log(respondingPercentage, 'responding percentage!!!!!!!!!!')
    console.log(correctPercentage, 'correct percentage!!!!!!!!!!!!')

    // Determine SporkWhale's status based on the conditions and update the trait displayed
    if (respondingPercentage > 10 && correctPercentage > 50) {
      // Move up a level
      const nextLevel = Math.min(
        currentLevel + 1,
        Object.keys(levelImages).length - 1
      )
      newTrait = levelImages[nextLevel]
      await sql`UPDATE trait_displayed SET trait = ${newTrait} WHERE channel_id = ${channel.id}`
    } else {
      // Move down a level
      const nextLevel = Math.max(currentLevel - 1, 0)
      newTrait = levelImages[nextLevel]
      await sql`UPDATE trait_displayed SET trait = ${newTrait} WHERE channel_id = ${channel.id}`
    }

    // Return new trait img
    return newTrait
  } catch (error) {
    console.error('Error calculating image based on channel responses:', error)
    throw error
  }
}

export async function createCollective(
  channel: string,
  cAddress: string,
  cWallet: string,
  cPool: string,
  salt: number
) {
  try {
      await sql`INSERT INTO collectives (channel, c_address, c_wallet, c_pool, salt) VALUES (${channel}, ${cAddress}, ${cWallet}, ${cPool}, ${salt});`
  } catch (error) {
    console.error('Error creating collective:', error)
    throw error
  }
}


export async function dbConnect() {
  const { Client } = require('pg')
  const client = new Client({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DATABASE,
    password: process.env.POSTGRES_PASSWORD,
    port: process.env.POSTGRES_PORT,
    ssl: {
      rejectUnauthorized: false,
    },
  })
  await client.connect()
  return client
} 