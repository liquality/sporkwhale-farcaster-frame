export type TSignedMessage = {
  untrustedData: {
    fid: number
    url: string
    messageHash: string
    timestamp: number
    network: number
    inputText: string
    buttonIndex: number
    castId: { fid: number; hash: string }
  }
  trustedData?: {
    messageBytes: string
  }
}

export type TUntrustedData = {
  fid: number
  url: string
  messageHash: string
  timestamp: number
  network: number
  inputText: string
  buttonIndex: number
  castId: { fid: number; hash: string }
}

export type TPostData =
  | 'start'
  | 'question'
  | 'correct-or-incorrect'
  | 'leaderboard'
  | 'error-be-a-follower'
  | 'start-mint'
  | 'mint'
  | 'follow-liquality'

export type TUserProfileNeynar = {
  object: 'user'
  fid: number
  custody_address: string
  username: string
  display_name: string
  pfp_url: string
  profile: {
    bio: {
      text: string
    }
  }
  follower_count: number
  following_count: number
  verifications: string[]
  active_status: 'active' | 'inactive'
}

export interface LevelImages {
  [key: string]: string
}

export interface ResponseItem {
  channel_id: number
  correct: number
  correct_percentage: number
  incorrect: number
  question_id: number
  total: number
}
export interface ResponsesData {
  [key: number]: ResponseItem
}

export type ClashData = {
  clash_id: number
  question_id: number
  question_text: string
  channel1_id: number
  channel_name_1: string
  channel2_id: number
  channel_name_2: string
  channel_winner_id: number
  responses: ResponsesData
}

export type ClashDataMap = {
  [key: string]: ClashData[]
}

export type CMetadata = {
  address: string
  wallet: string
  salt: number
}

// export type PoolParticipation = {
//   user: string
//   questionId: number
//   engagement: number
// }
// export interface PoolParticipationMap {
//   [key: string]: PoolParticipation[]
// }

export type PoolParticipation = {
  cAddress: string
  cWallet: string
  poolAddress: string
  user: string
  questionId: number
  engagement: number
}

export interface PoolParticipationMap {
  [key: string]: PoolParticipation
}
