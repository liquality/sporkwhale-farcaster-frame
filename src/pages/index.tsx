import { SERVER_URL } from '@/utils/generate-frames'
import { IMAGES } from '@/utils/utils';
import Head from 'next/head'
import { useEffect, useState } from 'react';

export default function Home() {

  //TODO here is what we decide will be the inital whale status
  //TODO we have to fetch data from the database, and based on that data render
  //different whale status

  const [moreThanOneUser, setMoreThanOneUser] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const response = await fetch('/api/getChannelData');
      const data = await response.json();
      setMoreThanOneUser(data.moreThanOneUser);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  console.log('More than one user?')

  let img = !moreThanOneUser ? IMAGES.question1_happy : IMAGES.question1_sad
  console.log(img, 'wats img?')
  //"http://localhost/image.jpg?" + new Date().getTime();
  return (
    <>
      <Head>
        <meta property="og:title" content="Frame" />
        <meta property="og:image" content={`${SERVER_URL}/${img}?${+ new Date().getTime()}`} />
        <meta property="fc:frame" content="vNext" />
        
        <meta property="fc:frame:image" content={`${SERVER_URL}/${img}?${+ new Date().getTime()}`} />
        <meta property="fc:frame:input:text" content="Type your answer" />
        <meta property="fc:frame:button:1" content="Submit ✉️" />
        <meta
          property="fc:frame:post_url"
          content={`${SERVER_URL}/api/post?data=start`}
        />
      <div>
        {!moreThanOneUser ? 'There are more than one users' : 'There is only one user'}
      </div>
        <div>Coolioo this is</div>
      </Head>
    </>
  )
}
