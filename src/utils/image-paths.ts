import { LevelImages } from '@/types'
const QUESTION_ID = parseInt(process.env.QUESTION_ID || '')

export const IMAGES = {
  welcome: `${QUESTION_ID}_welcome.png`,
  wrong_response: `${QUESTION_ID}_incorrect_response.png`,
  correct_response: `${QUESTION_ID}_correct_response.png`,
  question: `${QUESTION_ID}_question.png`,
  winning: `${QUESTION_ID}_winning.png`,
  losing: `${QUESTION_ID}_losing.png`,
  successfull_mint: `${QUESTION_ID}_successfull_mint.png`,
  mint: `${QUESTION_ID}_mint.png`,

  //Generic, these images are the same regardless of day
  error: 'error.png',
  already_submitted: 'already_submitted.png',
  be_a_follower: 'be_a_follower.png',
  expired: 'expired.png',
  not_eligable: 'be_a_follower.png',
  already_minted: 'already_claimed.png',
  start_mint: 'the_winner_is.png',
}

export const levelImages: LevelImages = {
  1: 'question_1.png',
  2: 'question_2.png',
  3: 'question_3.png',
  4: 'question_4.png',
  5: 'question_5.png',
}
