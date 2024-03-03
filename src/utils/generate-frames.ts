export const SERVER_URL = process.env.NGROK_OR_HOSTED_SERVER_URL
import { TPostData, TUntrustedData } from '../types'

// generate an html page with the relevant opengraph tags
export function generateFarcasterFrame(
  image: string,
  postData: TPostData,
  question?: any
) {
  let metaTags = ''

  console.log(postData, 'what is postdata?')
  switch (postData) {
    case 'question':
      let buttonMap = question.options.map(
        (option: string, index: number) =>
          `<meta property="fc:frame:button:${index + 1}" content=${option} />`
      )
      metaTags += `
			<meta property="fc:frame:image" content="${image}" />
      "${buttonMap}"
			`

      break
    case 'leaderboard':
      metaTags += `
      <meta property="fc:frame:image" content="${image}" />
      <meta property="fc:frame:button:1" content="🆚 See full bracket" />
      <meta property="fc:frame:button:1:action" content="post_redirect" />`

      break
    case 'correct-or-incorrect':
      metaTags += `
		<meta property="fc:frame:image" content="${image}" />
		<meta property="fc:frame:button:1" content="🙌 Next" />
    <meta property="fc:frame:button:2" content="🔔 Follow @liquality" />
		<meta property="fc:frame:button:2:action" content="post_redirect" />`
      break
    case 'error-be-a-follower':
      metaTags += `
      <meta property="fc:frame:image" content="${image}" />
      <meta property="fc:frame:button:1" content="Go interact with channel!" />
      <meta property="fc:frame:button:1:action" content="post_redirect" />`
      break

    case 'start-mint':
      metaTags += `
        <meta property="fc:frame:image" content="${image}" />
        <meta property="fc:frame:button:1" content="Go mint" />
       `
      break
    case 'mint':
      metaTags += `
          <meta property="fc:frame:image" content="${image}" />
          <meta property="fc:frame:button:1" content="🔆 Mint my Whaley NFT" />
          `
      break
  }

  console.log(
    process.env.QUESTION_ID,
    typeof process.env.QUESTION_ID,
    process.env.QUESTION_ID === '5',
    'QÄÄÄÄÄÄ'
  )
  const postUrl =
    process.env.QUESTION_ID === '5'
      ? `${SERVER_URL}/api/mint?data=${postData}`
      : `${SERVER_URL}/api/post?data=${postData}`

  console.log(postUrl, 'post url')
  return `
	  <!DOCTYPE html>
	  <html lang="en">
	  <head>
		<meta property="fc:frame" content="vNext" />
		${metaTags}
		<meta property="fc:frame:post_url" content="${postUrl}" />
	  </head>
	  <body>
	  </body>
	  </html>
	`
}
