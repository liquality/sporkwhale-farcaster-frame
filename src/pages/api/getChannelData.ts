import { NextApiRequest, NextApiResponse } from 'next'
import { sql } from '@vercel/postgres'

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  try {
    /*   const users = await sql`SELECT 
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
      user_question_responses.channel_id = 19`

    const hej = //0xb03f5438f9a243de5c3b830b7841ec315034cd5f
      await sql`select * from users where wallet_address = '0xb03F5438f9A243De5C3B830B7841EC315034cD5f'`
    const hejtwo = await sql`select * from users where id = 675;` */

    let participations = [
      '0xC79A902f45fC4D4d2073F6146d6b022E955cd194',
      '0xb03F5438f9A243De5C3B830B7841EC315034cD5f',
      '0x4DaF7f0076f10FA30E123D0B6455a538D4f0f388',
      '0x6A888657ef157D2e55FF54EDFA9Ee93647A8e118',
      '0x6e206F86Ad04c43d04bc1073c386C044dD3E7E71',
      '0x10B53a9F41A78e4CCCAaeA2C51dfb5F6Ff022318',
      '0x3E2dAba02b8b09879ed9b517bF4603a3DD9C410F',
      '0xeC427f89a0060c4e47aaa1EBfC06FADd593F46Ba',
      '0x56b8A0f575424a4e10dA4b8D9dD7d70b8848db3D',
      '0xFb0fdb59dEdc269f895A90E6bEfaab25CE55D6BD',
      '0x3f216864e9B71D17C483fbA83b1aF3Efe02F5d9E',
      '0x7937777eBeE338B6cE4433a92Cf850ce244B4764',
      '0xfD7E04D8B74Eb268a32Eb03F9f97ba038C66e1a0',
      '0xD8c84eaC995150662CC052E6ac76Ec184fcF1122',
      '0xD4Bf6958538f26266eF2a32dB47D296323734B5a',
      '0x2BB425C093729A6CD941480bBf9fbF48cd0b454e',
      '0xDE74F0a1e41E2756B2b932200B0Ea88Ac5f63A2A',
    ]

    let bu = await sql`SELECT uqr.*
    FROM user_question_responses AS uqr
    JOIN users AS u ON uqr.user_id = u.id
    WHERE LOWER(u.wallet_address) IN (
        '0xc79a902f45fc4d4d2073f6146d6b022e955cd194',
        '0xb03f5438f9a243de5c3b830b7841ec315034cd5f',
        '0x4daf7f0076f10fa30e123d0b6455a538d4f0f388',
        '0x6a888657ef157d2e55ff54edfa9ee93647a8e118',
        '0x6e206f86ad04c43d04bc1073c386c044dd3e7e71',
        '0x10b53a9f41a78e4cccaea2c51dfb5f6ff022318',
        '0x3e2daba02b8b09879ed9b517bf4603a3dd9c410f',
        '0xec427f89a0060c4e47aaa1ebfc06fadd593f46ba',
        '0x56b8a0f575424a4e10da4b8d9dd7d70b8848db3d',
        '0xfb0fdb59dedc269f895a90e6befaab25ce55d6bd',
        '0x3f216864e9b71d17c483fba83b1af3efe02f5d9e',
        '0x7937777ebee338b6ce4433a92cf850ce244b4764',
        '0xfd7e04d8b74eb268a32eb03f9f97ba038c66e1a0',
        '0xd8c84eac995150662cc052e6ac76ec184fcf1122',
        '0xd4bf6958538f26266ef2a32db47d296323734b5a',
        '0x2bb425c093729a6cd941480bbf9fbf48cd0b454e',
        '0xde74f0a1e41e2756b2b932200b0ea88ac5f63a2a'
    );
    
    `

    return response.status(200).json({ users: bu.rows })
  } catch (error) {
    return response.status(500).json({ error })
  }
}
