import { QueryResultRow, sql } from '@vercel/postgres'
import { generateFarcasterFrame, SERVER_URL } from './generate-frames'
import { TUntrustedData } from '../types'
import { IMAGES, levelImages } from './image-paths'
import { getAddrByFid } from './neynar-api'
import { mintSporkNFT } from './contract-operations'
const QUESTION_ID = parseInt(process.env.QUESTION_ID || '')
export async function saveUserQuestionResponse(
  ud: TUntrustedData,
  userId: number,
  correctResponse: boolean,
  response: string,
  channelId: number
) {
  //-----  WHEN TESTING COMMENT OUT THE DB SAVE QUESTION RESPONSE FOR NOW ----------------

  const existingQuestionResponse =
    await sql`SELECT * FROM "user_question_responses" 
          WHERE user_id = ${userId}
          AND question_id = ${QUESTION_ID} AND channel_id = ${channelId}`

  if (existingQuestionResponse.rowCount > 0) {
    console.log('Feedback already submitted by fid:', ud.fid)
    return generateFarcasterFrame(
      `${SERVER_URL}/${IMAGES.already_submitted}`,
      'correct-or-incorrect'
    )
  } else {
    await sql`INSERT INTO "user_question_responses" (question_id, user_id, correct_response, response, channel_id) VALUES (${QUESTION_ID}, ${userId}, ${correctResponse}, ${response}, ${channelId});`
    if (correctResponse) {
      console.log('Got into correctresponse!')

      return generateFarcasterFrame(
        `${SERVER_URL}/${IMAGES.correct_response}`,
        'correct-or-incorrect'
      )
    } else {
      console.log('Got into wrong response!')

      return generateFarcasterFrame(
        `${SERVER_URL}/${IMAGES.wrong_response}`,
        'correct-or-incorrect'
      )
    }
  }
}

export async function saveUser(ud: TUntrustedData) {
  console.log('trusted data in saveUser', ud)
  //If the user does not exist in db and this channel, create a new one
  const existingUser = await sql`SELECT * FROM users WHERE fid = ${ud.fid}`
  console.log('existing user', existingUser.rowCount)
  const walletAddress = await getAddrByFid(ud.fid)
  console.log('walletAddress', walletAddress)
  if (!existingUser.rowCount && walletAddress) {
    await sql`INSERT INTO users (fid, wallet_address) VALUES (${ud.fid}, ${walletAddress});`
    const selectedNewUser = await sql`SELECT * FROM users WHERE fid = ${ud.fid}`
    return selectedNewUser.rows[0]
  } else return existingUser.rows[0]
}

export async function setUserHasMinted(id: number): Promise<void> {
  const update = await sql`
  UPDATE users 
  set has_minted = true 
  where id = ${id}`
  console.log('setUserHasMinted => ', update)
}

export async function getChannel(channel: string) {
  const existingChannel =
    await sql`SELECT * FROM channels WHERE name = ${channel}`
  return existingChannel.rows[0]
}

export function getImageFromQuestionId(questionId: number) {
  return levelImages[questionId]
}

export async function getQuestionFromId(questionId: number) {
  const question = await sql`
  SELECT * FROM questions
  WHERE id = ${questionId}
  AND expires_at::timestamp  > current_timestamp;
  `
  return question.rows.length > 0 ? question.rows[0] : null
}

export async function getUserFromFid(fid: number) {
  const user = await sql`
  SELECT * FROM users
  WHERE fid = ${fid}
 ;
  `
  return user.rows.length > 0 ? user.rows[0] : null
}

export async function checkIfAvailableForMintAndMint(
  fid: number,
  channelName: string
): Promise<string> {
  let html = ''
  const checkIfUserHasParticipatedInChannelQuizQuery = await sql`SELECT EXISTS (
    SELECT 1
    FROM user_question_responses AS uqr
    JOIN channels AS c ON uqr.channel_id = c.id
    JOIN users AS u ON uqr.user_id = u.id
    WHERE u.fid = ${fid}              -- Use user's fid instead of user_id
    AND c.name = ${channelName}       -- Filter by channel name
);
`
  const userHasParticipatedInQuiz =
    checkIfUserHasParticipatedInChannelQuizQuery.rows[0]

  if (userHasParticipatedInQuiz.exists) {
    const channel = await getChannel(channelName)
    console.log(channel, 'got here because I have participated')
    const user = await getUserFromFid(fid)
    if (user) {
      if (!user.has_minted) {
        mintSporkNFT(user.wallet_address, channel.question_id)
          .then((tx) => {
            console.log(tx, 'calling setUserHasMinted: ', user.id)
            setUserHasMinted(user.id)
          })
          .catch((error) => {
            console.error('Error:', error)
            // Handle errors if necessary
          })
        html = generateFarcasterFrame(
          `${SERVER_URL}/${channel.question_id + '_successfull_mint.png'}`,
          'follow-liquality'
        )
      } else {
        html = generateFarcasterFrame(
          `${SERVER_URL}/${IMAGES.already_minted}`,
          'follow-liquality'
        )
      }
    }
  } else {
    console.log('user has not participated in channel:', channelName)

    html = generateFarcasterFrame(
      `${SERVER_URL}/${IMAGES.not_eligable}`,
      'leaderboard'
    )
  }
  return html
}

export async function getChannelStats(channel: QueryResultRow) {
  try {
    // Fetch total count of users in the specific channel
    const channelFollowerCount = channel.followers

    // Fetch total count of users in the specific channel
    const totalUsersQuery =
      await sql`SELECT COUNT(*) AS total_users FROM user_question_responses WHERE channel_id = ${channel.id}`
    const totalUsersCount = totalUsersQuery.rows[0].total_users
    console.log(totalUsersCount, 'total users count')

    // Fetch count of correct responses in the specific channel
    const correctResponsesQuery =
      await sql`SELECT COUNT(*) AS correct_responses FROM user_question_responses WHERE channel_id = ${channel.id} AND correct_response = TRUE`
    const correctResponsesCount =
      correctResponsesQuery.rows[0].correct_responses

    console.log(correctResponsesCount, 'correct responses count')

    // Calculate response percentages
    const respondingPercentage = (totalUsersCount / channelFollowerCount) * 100
    const correctPercentage = (correctResponsesCount / totalUsersCount) * 100

    console.log(correctPercentage, 'responding percentage')
    console.log(respondingPercentage, 'correct percentage')

    return { respondingPercentage, correctPercentage }
  } catch (error) {
    console.error('Error getting channel stats:', error)
    throw error
  }
}

export async function calculateIfWinningOrNot(channelName: string) {
  console.log(channelName, 'channelname')
  const channel = await getChannel(channelName)
  console.log(channel, 'wats channel')

  const getCurrentPairQuery =
    await sql`SELECT * FROM clashes WHERE (channel1_id = ${channel.id} OR channel2_id = ${channel.id}) AND question_id = ${QUESTION_ID};
    `
  const currentPair = getCurrentPairQuery.rows[0]
  const correctResponsesCountChannel1 = await getCorrectResponseFromChannelId(
    currentPair.channel1_id
  )
  console.log('channel1 id:', currentPair.channel1_id)
  const correctResponsesCountChannel2 = await getCorrectResponseFromChannelId(
    currentPair.channel2_id
  )

  let winnerId = null

  if (correctResponsesCountChannel1 > correctResponsesCountChannel2) {
    winnerId = currentPair.channel1_id
  } else if (correctResponsesCountChannel1 < correctResponsesCountChannel2) {
    winnerId = currentPair.channel2_id
  } else {
    // pick random channel
    console.log('pick random channel')
    const rand = Math.floor(Math.random() * (3 - 1) + 1)
    winnerId = rand === 1 ? currentPair.channel1_id : currentPair.channel2_id
  }
  console.log({ winnerId })

  if (channel.id == winnerId) {
    return generateFarcasterFrame(
      `${SERVER_URL}/${IMAGES.winning}`,
      'leaderboard'
    )
  } else {
    return generateFarcasterFrame(
      `${SERVER_URL}/${IMAGES.losing}`,
      'leaderboard'
    )
  }
}

export async function getCorrectResponseFromChannelId(channelId: number) {
  const correctResponsesQuery =
    await sql`SELECT COUNT(*) AS correct_responses FROM user_question_responses WHERE channel_id = ${channelId} AND question_id = ${QUESTION_ID} AND correct_response = TRUE`
  const totalResponsesQuery =
    await sql`SELECT COUNT(*) AS total_responses FROM user_question_responses WHERE channel_id = ${channelId} AND question_id = ${QUESTION_ID}`

  const correctResponsesCount = parseInt(
    correctResponsesQuery.rows[0].correct_responses || '0'
  )

  return correctResponsesCount
}

export async function calculateImageBasedOnChannelResponses(
  channelName: string
) {
  try {
    const channel = await getChannel(channelName)
    const channelFollowerCount = channel.followers

    let newTrait = ''
    // Fetch current level of the channel from the database

    const currentLevelQuery =
      await sql`SELECT question_id FROM channel WHERE channel_id = ${channel.id}`
    const currentLevel = currentLevelQuery.rows[0].question_id

    // Fetch total count of users in the specific channel
    const totalUsersQuery =
      await sql`SELECT COUNT(*) AS total_users FROM user_question_responses WHERE channel_id = ${channel.id}`
    const totalUsersCount = totalUsersQuery.rows[0].total_users

    // Fetch count of correct responses in the specific channel
    const correctResponsesQuery =
      await sql`SELECT COUNT(*) AS correct_responses FROM user_question_responses WHERE channel_id = ${channel.id} AND correct_response = TRUE`
    const correctResponsesCount =
      correctResponsesQuery.rows[0].correct_responses

    // Calculate response percentages
    const respondingPercentage = (totalUsersCount / channelFollowerCount) * 100
    const correctPercentage = (correctResponsesCount / totalUsersCount) * 100

    // Determine SporkWhale's status based on the conditions and update the trait displayed
    if (respondingPercentage > 10 && correctPercentage > 50) {
      // Move up a level
      const nextLevel = currentLevel + 1

      await sql`UPDATE channels SET question_id = ${nextLevel} WHERE channel_id = ${channel.id}`
    }
    //Else do nothing, since you cant go back a level or move down

    // Return new trait img
    return newTrait
  } catch (error) {
    console.error('Error calculating image based on channel responses:', error)
    throw error
  }
}

export async function createChannel(
  id: number,
  question_id: number,
  name: string,
  followers: number,
  cAddress: string,
  cWallet: string,
  cPool: string,
  salt: number
) {
  try {
    await sql`INSERT INTO channels (id, question_id, name, followers, c_address, c_wallet, c_pool, salt) 
      VALUES (${id},${question_id},${name}, ${followers}, ${cAddress}, ${cWallet}, ${cPool}, ${salt})
      ON CONFLICT (name)
      DO NOTHING;`
  } catch (error) {
    console.error('Error creating collective:', error)
    throw error
  }
}

// getParticipations fromt the user_question_responses table, group by channel_id, and count the number of responses per user per question
export async function getParticipations() {
  try {
    const participations = await sql`
    SELECT 
      channels.c_address As cAddress, 
      channels.c_wallet As cWallet, 
      channels.c_pool As poolAddress, 
      user_question_responses.question_id as questionId, 
      users.wallet_address AS user,
      users.id AS userId,
      channels.id AS channelId
    FROM 
      user_question_responses
    LEFT JOIN 
      users ON user_question_responses.user_id = users.id
    LEFT JOIN 
      channels ON user_question_responses.channel_id = channels.id
    WHERE 
      user_question_responses.is_onchain = false
    GROUP BY 
      channels.c_address, channels.c_wallet, channels.c_pool, user_question_responses.question_id, users.wallet_address, users.id, channels.id;
    `
    return participations
  } catch (error) {
    throw error
  }
}

// Update the user_question_responses table to mark the participations as onchain
export async function updateParticipation(participation: any) {
  try {
    await sql`UPDATE user_question_responses SET is_onchain = true WHERE 
    user_id = ${participation.userid} AND question_id = ${participation.questionid} AND 
    channel_id = ${participation.channelid};`
    return true
  } catch (error) {
    console.error(
      `Error updating participation: ${JSON.stringify(
        participation
      )}; Error: ${JSON.stringify(error)}`
    )
    return false
  }
}

export async function fetchChannels() {
  try {
    const channels =
      await sql`SELECT id, c_address As caddress, c_wallet As cwallet, c_pool As pooladdress, followers
     FROM channels`
    return channels.rows
  } catch (error) {
    throw error
  }
}

export async function getParticipantsByChannel(channelId: string) {
  try {
    const participants = await sql`
    SELECT 
      channels.c_address As cAddress, 
      channels.c_wallet As cWallet, 
      channels.c_pool As poolAddress, 
      user_question_responses.question_id as questionId, 
      users.wallet_address AS address,
      users.id AS userId,
      channels.id AS channelId
    FROM 
      user_question_responses
    LEFT JOIN 
      users ON user_question_responses.user_id = users.id
    LEFT JOIN 
      channels ON user_question_responses.channel_id = channels.id
    WHERE 
      user_question_responses.channel_id = ${channelId};
    `
    return participants.rows
  } catch (error) {
    throw error
  }
}

export async function getWinningChannel() {
  // get winner from last clash inserted into the clashes table
  const winner = await sql`
  SELECT clashes.channel_winner_id as id, channels.name as name
  FROM clashes
  LEFT JOIN 
    channels ON clashes.channel_winner_id = channels.id
  ORDER BY id DESC
  LIMIT 1;
  `
  return winner.rows[0]
}
