import { NextApiRequest, NextApiResponse } from 'next'
import * as database from '@/utils/database-operations'
import { PoolParticipation, PoolParticipationMap } from '@/types'
import { recordParticipation } from '@/utils/contract-operations'
import { channel } from 'diagnostics_channel'
export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method == 'GET') {
    try {
      let channelID = (await database.getWinningChannel()).id
      if (!channelID) {
        return response.status(404).json({
          status: 'Ok',
          message: `No winning channel found! challenge not over yet!`,
        })
      }

      // Get all participations from DB
      const channelParticipations = await database.getParticipantsByChannel(
        channelID
      )
      // console.log('channelParticipations:', channelParticipations)

      // group participations by user, count the number of responses per user per question as engagement and return only one user record with the total engagement
      const participationsByUser = groupedParticipationsByUser(
        channelParticipations
      )
      console.log('participationsByUser:', participationsByUser)

      // batch record participation by collectives onchain
      let participations: PoolParticipation[] = []
      for (const participation of Object.values(participationsByUser)) {
        participations.push(participation)
      }
      console.log('participations >> ', participations)
      participations = await recordParticipation(
        participations[0].cAddress,
        participations[0].cWallet,
        participations[0].poolAddress,
        participations
      )

      // Update the user_question_responses table to mark the participations as onchain

      await updateParticipations(participations)

      return response.status(200).json({
        status: 'Ok',
        message: `${channelParticipations.length} Participation recorded onchain successfully!`,
      })
    } catch (error) {
      // console.error('Error creating collectives:', error)
      return response.status(500).json({ error })
    }
  }
}

// update the user_question_responses table to mark the participations as onchain
async function updateParticipations(participations: any) {
  try {
    for (const participation of participations) {
      database.updateParticipation(participation)
    }
  } catch (error) {
    // console.error('Error updating participations:', error)
    throw error
  }
}

function groupedParticipationsByUser(
  participations: any
): PoolParticipationMap {
  const result = participations.reduce((acc: any, participation: any) => {
    const key = participation.address
    if (!acc[key]) {
      acc[key] = {
        cAddress: participation.caddress,
        cWallet: participation.cwallet,
        poolAddress: participation.pooladdress,
        questionId: participation.questionid,
        user: participation.address,
        engagement: 1,
      }
    } else {
      acc[key].engagement += 1
    }
    return acc
  }, {})

  return result
}
