import { css } from '@emotion/css'
import PodcastPlayer from '../../../components/podcast-player/podcast-player'
import { GetServerSidePropsContext } from 'next'
import Head from 'next/head'
import { API_BASE_URL, ASSETS_BASE_URL, WEBSITE_TITLE } from '../../../util/constants'
import { useEffect, useMemo, useState } from 'react'
import ShareLinkModal from '../../../components/share-link-modal'
import { useRouter } from 'next/router'
import Color from 'color'

function AudioPlayer(props: {
  coverUrl: string
  enclosureUrl: string
  podcastName: string
  themeColor: string
  title: string
}) {
  const router = useRouter()
  const { id } = router.query
  const [isQrCodeModalVisible, setIsQrCodeModalVisible] = useState(false)
  const [url, setUrl] = useState('')

  const suitableThemeColor = useMemo(() => {
    const color = Color(props.themeColor)
    // The WCAG level AA requires a contrast ratio of at least 4.5:1 for normal text.
    // See <https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html>.
    return color.contrast(color.darken(0.7)) < 4.5 ? color.lighten(0.15).string() : props.themeColor
  }, [props.themeColor])

  useEffect(() => {
    setUrl(window.location.href)
  }, [])

  return (
    <div
      className={css`
        display: flex;
        flex-direction: column;
        height: var(--app-height);
        width: 100vw;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      `}
    >
      <Head>
        <title>
          {props.title} - {WEBSITE_TITLE}
        </title>
        <meta property="og:title" content={props.title} />
        <meta property="og:description" content={props.title} />
        <meta property="og:image" content={props.coverUrl} />
        <meta property="og:audio" content={props.enclosureUrl} />
        <meta property="twitter:card" content="summary" />
        <meta property="twitter:image" content={props.coverUrl} />
        <meta property="twitter:title" content={props.title} />
        <meta property="twitter:description" content={props.title} />
      </Head>
      <div
        className={css`
          width: 100%;
          height: 100%;
          position: absolute;
          top: 0;
          right: 0;
          background-color: ${Color(props.themeColor).darken(0.7).string()};
          z-index: -3;
        `}
      />
      <div
        className={css`
          width: 50%;
          height: 50%;
          position: absolute;
          bottom: -25%;
          left: -25%;
          border-radius: 50%;
          background-color: ${suitableThemeColor};
          filter: blur(128px);
          z-index: -2;
        `}
      />
      <div
        className={css`
          width: 50%;
          height: 50%;
          position: absolute;
          top: -25%;
          right: -25%;
          border-radius: 50%;
          background-color: ${suitableThemeColor};
          filter: blur(128px);
          z-index: -2;
        `}
      />
      <div
        className={css`
          width: 100%;
          height: 100%;
          position: absolute;
          top: 0;
          left: 0;
          background-color: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(128px);
          z-index: -1;
        `}
      />
      <img
        alt="Share"
        title="Share"
        src={`${ASSETS_BASE_URL}/icons/share.svg`}
        className={css`
          width: 26px;
          height: 26px;
          position: absolute;
          top: 12px;
          right: 12px;
          cursor: pointer;
        `}
        onClick={() => {
          setIsQrCodeModalVisible(true)
        }}
      />
      <img
        alt="podcast cover"
        title={props.title}
        src={props.coverUrl || `${ASSETS_BASE_URL}/images/podcast.svg`}
        className={css`
          max-height: 300px;
          height: calc(var(--app-height) * 0.5);
          border-radius: 5px;
          aspect-ratio: 1;
          margin-bottom: calc(var(--app-height) * 0.05);
          transition: max-height 0.2s ease-in-out;
          @media (max-height: 667px) {
            max-height: 250px;
            margin-bottom: calc(var(--app-height) * 0.03);
          }

          @media (max-height: 560px) {
            max-height: 150px;
            margin-bottom: 5px;
          }

          @media (max-height: 430px) {
            display: none;
          }
        `}
      />
      <PodcastPlayer
        roomId={id as string}
        title={props.title}
        podcastName={props.podcastName}
        themeColor={suitableThemeColor}
        audioUrl={props.enclosureUrl}
        coverUrl={props.coverUrl}
      />
      <ShareLinkModal
        isVisible={isQrCodeModalVisible}
        url={url}
        onNegative={() => setIsQrCodeModalVisible(false)}
      />
    </div>
  )
}

AudioPlayer.defaultProps = {
  themeColor: 'hsl(35,60.2%,57.6%)',
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { id } = context.query
  const data = await fetch(`${API_BASE_URL}/room/${id}`)
    .then((res) => res.json())
    .catch((err) => console.log(err))
  if (!data || data.code !== 200) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }
  return {
    props: {
      ...data.data.mediaData,
    },
  }
}

export default AudioPlayer
