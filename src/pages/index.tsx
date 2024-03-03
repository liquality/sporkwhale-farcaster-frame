import LeaderboardDesktop from '@/components/leaderboard-desktop'
import { ClashDataMap } from '@/types'
import { SERVER_URL } from '@/utils/generate-frames'
import { IMAGES } from '@/utils/image-paths'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
import LeaderboardMobile from '../components/leaderboard-mobile'
export default function Home() {
  const [isMobileState, setIsMobileState] = useState(false)
  const [questionId, setQuestionId] = useState(5)
  const [leaderboard, setLeaderboard] = useState<null | ClashDataMap[]>(null)
  const [loading, setLoading] = useState(false)
  const [expandedDay, setExpandedDay] = useState<number | null>(null)

  useEffect(() => {
    setIsMobileState(isMobile)
  }, [isMobile])
  useEffect(() => {
    if (!leaderboard) {
      const fetchData = async () => {
        try {
          const response = await fetch('/api/getLeaderboardData')
          const data = await response.json()
          setLeaderboard(data.leaderboard)
        } catch (error) {
          console.error('Error fetching data:', error)
        }
      }
      fetchData()
    }
  }, [leaderboard])

  let image = ''
  let postUrl = ''
  let text = ''
  if (questionId === 5) {
    image = IMAGES.start_mint
    postUrl = '/api/mint?data=start-mint'
    text = '🔆 Mint my Whaley NFT'
  } else {
    image = IMAGES.welcome
    postUrl = '/api/post?data=start'
    text = '🔆 Play Clash of Channels!'
  }
  return (
    <>
      <Head>
        <meta property="og:title" content="Frame" />
        <meta property="og:image" content={`${SERVER_URL}/${image}`} />
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content={`${SERVER_URL}/${image}`} />
        <meta property="fc:frame:button:1" content={text} />
        <meta
          property="fc:frame:post_url"
          content={`${SERVER_URL}${postUrl}`}
        />
      </Head>
      {leaderboard ? (
        <>
          {' '}
          {isMobileState ? (
            <LeaderboardMobile
              leaderboard={leaderboard}
              currentDay={questionId}
            />
          ) : (
            <LeaderboardDesktop
              leaderboard={leaderboard}
              currentDay={questionId}
            />
          )}
        </>
      ) : null}
    </>
  )
}
