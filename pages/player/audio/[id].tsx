import {css} from "@emotion/css";
import PodcastPlayer from "../../../components/podcast-player/podcast-player";
import {GetServerSidePropsContext} from "next";
import Head from "next/head";
import {API_BASE_URL, ASSETS_BASE_URL} from "../../../util/constants";
import {useEffect, useState} from "react";
import ShareLinkModal from "../../../components/share-link-modal";
import {useRouter} from "next/router";

function AudioPlayer(props: {
    coverUrl: string
    enclosureUrl: string
    podcastName: string
    themeColor: string
    title: string
}) {
    const router = useRouter()
    const {id} = router.query
    const [isQrCodeModalVisible, setIsQrCodeModalVisible] = useState(false)
    const [url, setUrl] = useState('')

    useEffect(() => {
        setUrl(window.location.href)
    }, [])

    return <div className={css`
      display: flex;
      flex-direction: column;
      height: var(--app-height);
      width: 100vw;
      background-color: #231e1b;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    `}
    >
        <Head>
            <title>{props.title} - ✨ Hikari Listen Together</title>
        </Head>
        <img
            alt='Share'
            title='Share'
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
            alt='podcast cover'
            title={props.title}
            src={props.coverUrl}
            className={css`
              max-height: 300px;
              height: calc(var(--app-height) * .5);
              border-radius: 5px;
              aspect-ratio: 1;
              margin-bottom: calc(var(--app-height) * .05);
            `}
        />
        <PodcastPlayer
            roomId={id as string}
            title={props.title}
            podcastName={props.podcastName}
            themeColor={props.themeColor}
            audioUrl={props.enclosureUrl}
            coverUrl={props.coverUrl}
        />
        <ShareLinkModal
            isVisible={isQrCodeModalVisible}
            url={url}
            onNegative={() => setIsQrCodeModalVisible(false)}
        />
    </div>
}


export async function getServerSideProps(context: GetServerSidePropsContext) {
    const {id} = context.query

    const data = await fetch(`${API_BASE_URL}/room/${id}`)
        .then(res => res.json())
        .catch(() => {
            return {
                redirect: {
                    destination: '/',
                    permanent: false
                }
            }
        })
    if (data.code !== 200) {
        return {
            redirect: {
                destination: '/',
                permanent: false
            }
        }
    }
    return {
        props: {
            ...data.data.mediaData
        }
    }
}

export default AudioPlayer
