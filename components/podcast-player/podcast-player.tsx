import ControlButtons from "./control-buttons";
import ProgressBar from "./progress-bar";
import {css} from "@emotion/css";
import {useCallback, useEffect, useRef, useState} from "react";
import {generateUserId, secondsToTime} from '../../util/player'
import {toast} from "react-toastify";
import {WS_BASE_URL} from "../../util/constants";
import useWebSocket, {ReadyState} from "react-use-websocket";
import {useDebouncedCallback} from "use-debounce";

function PodcastPlayer(props: {
    roomId: string
    title: string
    podcastName: string
    themeColor: string
    audioUrl: string
    coverUrl: string
    playSpeedSelections: number[]
}) {
    const [isPlaying, setIsPlaying] = useState(false)

    const [playedTime, setPlayTime] = useState('00:00:00')
    const [leftTime, setLeftTime] = useState('00:00:00')

    const [playedProgress, setPlayedProgress] = useState(0)
    const [isPlayable, setIsPlayable] = useState(false)

    const [playSpeed, setPlaySpeed] = useState(1.0)

    const [isSeeking, setIsSeeking] = useState(false)

    const audioPlayerRef = useRef<HTMLAudioElement>(null)

    const userIdRef = useRef(generateUserId())

    const {sendMessage, lastMessage, readyState} = useWebSocket(`${WS_BASE_URL}/${props.roomId}`, {
        shouldReconnect: () => true,
        reconnectAttempts: 10,
        reconnectInterval: 3000,
    });

    const connectionStatus = {
        [ReadyState.CONNECTING]: '正在建立连接…',
        [ReadyState.OPEN]: '已连接',
        [ReadyState.CLOSING]: '断开连接…',
        [ReadyState.CLOSED]: '连接已断开',
        [ReadyState.UNINSTANTIATED]: '未知',
    }[readyState];

    const handlePlay = useCallback(() => {
        if (audioPlayerRef.current) {
            sendMessage(JSON.stringify({
                event: 'play',
                userId: userIdRef.current,
                data: null
            }))
            audioPlayerRef.current.play()
        }
    }, [sendMessage])

    const handlePause = useCallback(() => {
        if (audioPlayerRef.current) {
            sendMessage(JSON.stringify({
                event: 'pause',
                userId: userIdRef.current,
                data: null
            }))
            audioPlayerRef.current.pause()
        }
    }, [sendMessage])

    const handleSeekTo = useCallback((seekTo: number) => {
        if (audioPlayerRef.current) {
            sendMessage(JSON.stringify({
                event: 'seekTo',
                userId: userIdRef.current,
                data: seekTo
            }))
            audioPlayerRef.current.currentTime = seekTo
        }
    }, [sendMessage])

    const handlePlaySpeedChange = useCallback((playSpeed: number) => {
        if (audioPlayerRef.current) {
            sendMessage(JSON.stringify({
                event: 'playSpeed',
                userId: userIdRef.current,
                data: playSpeed
            }))
            audioPlayerRef.current.playbackRate = playSpeed
        }
    }, [sendMessage])

    const handleForward = useCallback(() => {
        if (audioPlayerRef.current) {
            const seekTo = audioPlayerRef.current.currentTime + 30 > audioPlayerRef.current.duration
                ? audioPlayerRef.current.duration
                : audioPlayerRef.current.currentTime + 30
            sendMessage(JSON.stringify({
                event: 'seekTo',
                userId: userIdRef.current,
                data: seekTo
            }))
            audioPlayerRef.current.currentTime = seekTo
        }
    }, [sendMessage])

    const handleBackward = useCallback(() => {
        if (audioPlayerRef.current) {
            const seekTo = audioPlayerRef.current.currentTime - 15 < 0
                ? 0
                : audioPlayerRef.current.currentTime - 15
            sendMessage(JSON.stringify({
                event: 'seekTo',
                userId: userIdRef.current,
                data: seekTo
            }))
            audioPlayerRef.current.currentTime = seekTo
        }
    }, [sendMessage])

    const debouncedSeekTo = useDebouncedCallback((newCurrentTime: number) => {
        if (audioPlayerRef.current) {
            audioPlayerRef.current.currentTime = newCurrentTime
            sendMessage(JSON.stringify({
                event: 'seekTo',
                userId: userIdRef.current,
                data: newCurrentTime
            }))
        }
    }, 50)

    useEffect(() => {
        const handleLoadedMetaData = () => {
            setIsPlayable(true)
            setLeftTime(secondsToTime(audioPlayerRef.current!.duration))
        }
        const handleLoadedData = () => {
            setIsPlayable(true)
        }
        const handleCanPlay = () => {
            setIsPlayable(true)
        }
        let player: HTMLAudioElement | null = null
        if (audioPlayerRef.current) {
            audioPlayerRef.current.src = props.audioUrl
            audioPlayerRef.current.addEventListener('loadedmetadata', handleLoadedMetaData)
            audioPlayerRef.current.addEventListener('loadeddata', handleLoadedData)
            audioPlayerRef.current.addEventListener('canplay', handleCanPlay)
            player = audioPlayerRef.current
        }
        return () => {
            if (player) {
                player.removeEventListener('loadedmetadata', handleLoadedMetaData)
                player.removeEventListener('loadeddata', handleLoadedData)
                player.removeEventListener('canplay', handleCanPlay)
            }
        }
    }, [audioPlayerRef, props.audioUrl])

    useEffect(() => {
        if (lastMessage !== null) {
            const websocketMessage = JSON.parse(lastMessage.data)
            if (websocketMessage['userId'] !== userIdRef.current && audioPlayerRef.current) {
                switch (websocketMessage['event']) {
                    case 'seekTo':
                        if (websocketMessage['data'] > audioPlayerRef.current.duration) {
                            audioPlayerRef.current.currentTime = audioPlayerRef.current.duration
                        } else if (websocketMessage['data'] < 0) {
                            audioPlayerRef.current.currentTime = 0
                        } else {
                            audioPlayerRef.current.currentTime = websocketMessage['data']
                        }
                        break
                    case 'play':
                        audioPlayerRef.current.volume = 1.0
                        audioPlayerRef.current.play()
                        break
                    case 'pause':
                        audioPlayerRef.current.pause()
                        break
                    case 'playSpeed':
                        audioPlayerRef.current.playbackRate = websocketMessage['data']
                        break
                    default:
                        console.log(`Unknown event: ${websocketMessage['event']}`)
                        break
                }
            }
        }
    }, [lastMessage])

    useEffect(() => {
        if ('mediaSession' in navigator) {
            // See <https://developer.mozilla.org/en-US/docs/Web/API/MediaMetadata/MediaMetadata>.
            navigator.mediaSession.metadata = new MediaMetadata({
                title: props.title,
                artist: props.podcastName,
                album: props.podcastName,
                artwork: [{
                    src: props.coverUrl
                }]
            })
        }
    }, [props.coverUrl, props.podcastName, props.title])

    useEffect(() => {
        if ('mediaSession' in navigator) {
            // See <https://developer.mozilla.org/en-US/docs/Web/API/MediaSession/setActionHandler>.
            navigator.mediaSession.setActionHandler('play', handlePlay)
            navigator.mediaSession.setActionHandler('pause', handlePause)
            navigator.mediaSession.setActionHandler('seekto', e => {
                if (e.seekTime) {
                    handleSeekTo(e.seekTime)
                }
            })
            navigator.mediaSession.setActionHandler('seekforward', handleForward)
            navigator.mediaSession.setActionHandler('seekbackward', handleBackward)
        }
    }, [handleBackward, handleForward, handlePause, handlePlay, handleSeekTo])

    return <div className={css`
      display: flex;
      flex-direction: column;
      width: 80%;
      align-items: center;
    `}>
        <div className={css`
          color: #fff;
          font-size: 1.2rem;
          font-weight: 600;
          text-align: center;
        `}>
            {props.title}
        </div>
        <div className={css`
          color: ${props.themeColor};
          font-size: 1.1rem;
          font-weight: 500;
          text-align: center;
        `}>
            {props.podcastName}
        </div>
        <div className={css`
          display: flex;
          justify-content: space-between;
          color: #fff;
          width: 100%;
          margin-top: 15px;
        `}>
            <div>{playedTime}</div>
            <div>-{leftTime}</div>
        </div>
        <ProgressBar
            progress={playedProgress}
            margin={{top: 5}}
            onSeekBegin={() => setIsSeeking(true)}
            onSeekEnd={() => setIsSeeking(false)}
            onSeek={newProgress => {
                if (audioPlayerRef.current) {
                    setPlayedProgress(newProgress)
                    debouncedSeekTo(audioPlayerRef.current.duration * newProgress)
                }
            }}
        />
        <ControlButtons
            themeColor={props.themeColor}
            isPlayable={isPlayable}
            margin={{top: 20}}
            isPlaying={isPlaying}
            playSpeed={playSpeed}
            playSpeedSelections={props.playSpeedSelections}
            onPlaySpeedChange={handlePlaySpeedChange}
            onPlayClick={() => {
                if (!isPlayable) {
                    toast.error('音频还未加载完毕！')
                    return
                }
                if (isPlaying) {
                    handlePause()
                } else {
                    handlePlay()
                }
            }}
            onBackwardClick={handleBackward}
            onForwardClick={handleForward}
            onSyncToEveryOneClick={() => {
                if (audioPlayerRef.current) {
                    handleSeekTo(audioPlayerRef.current.currentTime)
                }
            }}
        />
        <div className={css`
          color: #fff;
          margin-top: 15px;
        `}>
            {connectionStatus}
        </div>
        <audio
            controls={false}
            preload='auto'
            autoPlay={false}
            ref={audioPlayerRef}
            onTimeUpdate={e => {
                const target = e.target as HTMLAudioElement
                const currentTime = parseInt(target.currentTime.toFixed(0))
                const duration = parseInt(target.duration.toFixed(0))
                setPlayTime(secondsToTime(currentTime))
                setLeftTime(secondsToTime(duration - currentTime))
                if (!isSeeking) {
                    setPlayedProgress(duration === 0 ? 0 : currentTime / duration)
                }
            }}
            onPlay={() => {
                setIsPlaying(true)
            }}
            onPause={() => {
                setIsPlaying(false)
            }}
            onRateChange={e => {
                setPlaySpeed((e.target as HTMLAudioElement).playbackRate)
            }}
            onEnded={() => {
                setIsPlaying(false)
            }}
        ></audio>
    </div>
}

PodcastPlayer.defaultProps = {
    playSpeedSelections: [0.5, 0.8, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0, 2.5],
    themeColor: 'hsl(35,60.2%,57.6%)'
}

export default PodcastPlayer
