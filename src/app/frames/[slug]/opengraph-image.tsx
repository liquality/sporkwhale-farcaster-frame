
import { ImageResponse } from 'next/og'
 
// Route segment config
export const runtime = 'edge'
export const dynamic = 'force-dynamic'

// Image metadata
export const alt = 'About Acme'
export const size = {
  width: 250,
  height: 250,
}
 
export const contentType = 'image/png'
 
// Image generation
export default async function Image({ params }: { params: { slug: string } }) {
  // Fon
  console.log({ params })
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 16,
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {params.slug}
      </div>
    ),
    // ImageResponse options
    {
      // For convenience, we can re-use the exported opengraph-image
      // size config to also set the ImageResponse's width and height.
      ...size,
    }
  )
}