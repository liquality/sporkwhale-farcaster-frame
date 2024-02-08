export const SERVER_URL = process.env.NGROK_OR_HOSTED_SERVER_URL
import { TPostData, TUntrustedData } from '../types'

// generate an html page with the relevant opengraph tags
export function generateFarcasterFrame(image: string, postData: TPostData) {
  let metaTags = ''

  switch (postData) {

    case 'mint':
      metaTags += `
		  <meta property="fc:frame:image" content="${image}" />
		  <meta property="fc:frame:button:1" content="Mint ✨ ${image}" />`
      break
    case 'redirect':
      metaTags += `
		  <meta property="fc:frame:image" content="${image}" />
		  <meta property="fc:frame:button:1" content="Go see leaderboard!" />
		  <meta property="fc:frame:button:1:action" content="post_redirect" />`
      break
	  case 'question':
		metaTags += `
			<meta property="fc:frame:image" content="${image}" />
			<meta property="fc:frame:input:text" content="Type your answer" />
			<meta property="fc:frame:button:1" content="Submit ✉️" />
			`
		break
    case 'error':
      metaTags += `
		<meta property="fc:frame:image" content="${image}" />
		<meta property="fc:frame:button:1" content="Follow /addresso for the next drop" />
		<meta property="fc:frame:button:1:action" content="post_redirect" />`
      break
  }

  const postUrl = `${SERVER_URL}/api/post?data=${postData}`

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