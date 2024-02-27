import { fetchGraphql } from './graphsql'

export const AIRSTACK_ENDPOINT = 'https://api.airstack.xyz/gql'

export async function getIfUserIsInChannel(
  channel: string,
  fid: number
): Promise<any> {
  const query = `query Query($participant: Identity, $channelName: String) {
        FarcasterChannelParticipants(
          input: {
                filter: { participant: { _eq: $participant }, 
                channelName: { _regex: $channelName } }, 
                blockchain: ALL 
            }
        ) {
          FarcasterChannelParticipant {
            channelActions
            channelName
            channelId
          }
        }
      }`
  const variables = {
    participant: `fc_fid:${fid}`,
    channelName: channel,
  }
  const data = await fetchGraphql(
    AIRSTACK_ENDPOINT,
    {
      'Content-Type': 'application/json',
      Authorization: process.env.AIRSTACK_API_KEY || '',
    },
    'POST',

    query,
    variables
  )

  const actions =
    data?.FarcasterChannelParticipants?.FarcasterChannelParticipant
      ?.channelActions
  return !!(actions && (actions.includes('reply') || actions.includes('cast')))
}