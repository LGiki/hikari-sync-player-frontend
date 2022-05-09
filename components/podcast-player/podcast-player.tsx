import ControlButtons from './control-buttons'
import ProgressBar from './progress-bar'
import { css } from '@emotion/css'
import { useCallback, useEffect, useRef, useState } from 'react'
import { generateUserId, secondsToTime } from '../../util/player'
import { toast } from 'react-toastify'
import { WS_BASE_URL } from '../../util/constants'
import useWebSocket, { ReadyState } from 'react-use-websocket'
import { useDebouncedCallback } from 'use-debounce'

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

  // isPlayButtonClicked indicates whether the user has clicked the play button,
  // and will remain true after the play button has been clicked.
  const [isPlayButtonClicked, setIsPlayButtonClicked] = useState(false)

  const [playedTime, setPlayTime] = useState('00:00:00')
  const [leftTime, setLeftTime] = useState('00:00:00')

  const [playedProgress, setPlayedProgress] = useState(0)
  const [isPlayable, setIsPlayable] = useState(false)

  const [playSpeed, setPlaySpeed] = useState(1.0)

  const [isSeeking, setIsSeeking] = useState(false)

  const audioPlayerRef = useRef<HTMLAudioElement>(null)

  const userIdRef = useRef(generateUserId())

  const { sendMessage, lastMessage, readyState } = useWebSocket(`${WS_BASE_URL}/${props.roomId}`, {
    shouldReconnect: () => true,
    reconnectAttempts: 10,
    reconnectInterval: 3000,
  })

  const connectionStatus = {
    [ReadyState.CONNECTING]: '正在建立连接…',
    [ReadyState.OPEN]: '已连接',
    [ReadyState.CLOSING]: '断开连接…',
    [ReadyState.CLOSED]: '连接已断开',
    [ReadyState.UNINSTANTIATED]: '未知',
  }[readyState]

  const handlePlay = useCallback(
    (broadcast: boolean = true) => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.volume = 1.0
        audioPlayerRef.current
          .play()
          .then(() => {
            // send the play message only when the audio is successfully played
            if (broadcast) {
              sendMessage(
                JSON.stringify({
                  event: 'play',
                  userId: userIdRef.current,
                  data: null,
                }),
              )
            }
          })
          .catch((e) => {
            if (e.name === 'NotAllowedError') {
              toast.error('播放失败，您的浏览器禁止播放音频，请重新点击播放按钮或刷新页面重试')
            } else if (e.name === 'NotSupportedError') {
              toast.error('播放失败，您的浏览器不支持该格式的音频文件')
            } else {
              toast.error(`播放失败，未知错误：${e.message}`)
            }
          })
      }
    },
    [sendMessage],
  )

  const handlePause = useCallback(
    (broadcast: boolean = true) => {
      if (audioPlayerRef.current) {
        if (broadcast) {
          sendMessage(
            JSON.stringify({
              event: 'pause',
              userId: userIdRef.current,
              data: null,
            }),
          )
        }
        audioPlayerRef.current.pause()
      }
    },
    [sendMessage],
  )

  const handleSeekTo = useCallback(
    (seekTo: number, broadcast: boolean = true) => {
      if (audioPlayerRef.current) {
        let realSeekTo = seekTo
        if (seekTo > audioPlayerRef.current.duration) {
          realSeekTo = audioPlayerRef.current.duration
        } else if (seekTo < 0) {
          realSeekTo = 0
        }
        if (broadcast) {
          sendMessage(
            JSON.stringify({
              event: 'seekTo',
              userId: userIdRef.current,
              data: realSeekTo,
            }),
          )
        }
        audioPlayerRef.current.currentTime = realSeekTo
      }
    },
    [sendMessage],
  )

  const handlePlaySpeedChange = useCallback(
    (playSpeed: number, broadcast: boolean = true) => {
      if (audioPlayerRef.current) {
        if (broadcast) {
          sendMessage(
            JSON.stringify({
              event: 'playSpeed',
              userId: userIdRef.current,
              data: playSpeed,
            }),
          )
        }
        audioPlayerRef.current.playbackRate = playSpeed
      }
    },
    [sendMessage],
  )

  const handleForward = useCallback(
    (broadcast: boolean = true) => {
      if (audioPlayerRef.current) {
        const seekTo =
          audioPlayerRef.current.currentTime + 30 > audioPlayerRef.current.duration
            ? audioPlayerRef.current.duration
            : audioPlayerRef.current.currentTime + 30
        if (broadcast) {
          sendMessage(
            JSON.stringify({
              event: 'seekTo',
              userId: userIdRef.current,
              data: seekTo,
            }),
          )
        }
        audioPlayerRef.current.currentTime = seekTo
      }
    },
    [sendMessage],
  )

  const handleBackward = useCallback(
    (broadcast: boolean = true) => {
      if (audioPlayerRef.current) {
        const seekTo =
          audioPlayerRef.current.currentTime - 15 < 0 ? 0 : audioPlayerRef.current.currentTime - 15
        if (broadcast) {
          sendMessage(
            JSON.stringify({
              event: 'seekTo',
              userId: userIdRef.current,
              data: seekTo,
            }),
          )
        }
        audioPlayerRef.current.currentTime = seekTo
      }
    },
    [sendMessage],
  )

  const handleSyncButtonClick = useCallback(() => {
    sendMessage(
      JSON.stringify({
        event: 'getPlayState',
        userId: userIdRef.current,
        data: null,
      }),
    )
  }, [sendMessage])

  const sendHelloMessage = useCallback(() => {
    sendMessage(
      JSON.stringify({
        event: 'hello',
        userId: userIdRef.current,
        data: null,
      }),
    )
  }, [sendMessage])

  const updatePlayState = useCallback(
    (playTime: number, isPlaying: boolean, playSpeed: number) => {
      const timestamp = new Date().getTime()
      sendMessage(
        JSON.stringify({
          event: 'updatePlayState',
          userId: userIdRef.current,
          data: {
            playTime: playTime,
            isPlaying: isPlaying,
            playSpeed: playSpeed,
            timestamp: timestamp,
          },
        }),
      )
    },
    [sendMessage],
  )

  const debouncedSeekTo = useDebouncedCallback(
    (newCurrentTime: number, broadcast: boolean = true) => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.currentTime = newCurrentTime
        if (broadcast) {
          sendMessage(
            JSON.stringify({
              event: 'seekTo',
              userId: userIdRef.current,
              data: newCurrentTime,
            }),
          )
        }
      }
    },
    50,
  )

  useEffect(() => {
    if (isPlayButtonClicked) {
      const intervalId = setInterval(() => {
        if (audioPlayerRef.current) {
          updatePlayState(Math.floor(audioPlayerRef.current.currentTime), isPlaying, playSpeed)
        }
      }, 5000)
      return () => clearInterval(intervalId)
    }
  }, [isPlayButtonClicked, isPlaying, playSpeed, updatePlayState])

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
            handleSeekTo(websocketMessage['data'], false)
            break
          case 'play':
            audioPlayerRef.current.volume = 1.0
            audioPlayerRef.current.play().catch((e) => {
              if (e.name === 'NotAllowedError') {
                toast.error(
                  <>
                    与您一起听的好友尝试播放音频，但您的浏览器禁止播放音频，请手动点击<b>同步</b>
                    按钮同步您的播放状态
                  </>,
                )
              } else if (e.name === 'NotSupportedError') {
                toast.error('与您一起听的好友尝试播放音频，但您的浏览器不支持该格式的音频文件')
              } else {
                toast.error(`与您一起听的好友尝试播放音频，但发生了未知错误：${e.message}`)
              }
            })
            break
          case 'pause':
            handlePause(false)
            break
          case 'playSpeed':
            handlePlaySpeedChange(websocketMessage['data'], false)
            break
          case 'hello':
          case 'playState':
            if (websocketMessage['data'] === null) {
              // Show error toast only when the event is 'playState'
              if (websocketMessage['event'] === 'playState') {
                toast.error('无法同步进度，请稍后重试')
              }
            } else {
              const playTime = websocketMessage['data']['playTime']
              const isPlaying = websocketMessage['data']['isPlaying']
              const playSpeed = websocketMessage['data']['playSpeed']
              handleSeekTo(playTime, false)
              isPlaying ? handlePlay(false) : handlePause(false)
              handlePlaySpeedChange(playSpeed, false)
              toast.success('已为您同步到好友的播放位置')
            }
            break
          default:
            console.log(`Unknown event: ${websocketMessage['event']}`)
            break
        }
      }
    }
  }, [handlePause, handlePlay, handlePlaySpeedChange, handleSeekTo, lastMessage])

  useEffect(() => {
    if ('mediaSession' in navigator) {
      // See <https://developer.mozilla.org/en-US/docs/Web/API/MediaMetadata/MediaMetadata>.
      navigator.mediaSession.metadata = new MediaMetadata({
        title: props.title,
        artist: props.podcastName,
        album: props.podcastName,
        artwork: [
          {
            src: props.coverUrl,
          },
        ],
      })
    }
  }, [props.coverUrl, props.podcastName, props.title])

  useEffect(() => {
    if ('mediaSession' in navigator) {
      // See <https://developer.mozilla.org/en-US/docs/Web/API/MediaSession/setActionHandler>.
      navigator.mediaSession.setActionHandler('play', () => handlePlay())
      navigator.mediaSession.setActionHandler('pause', () => handlePause())
      navigator.mediaSession.setActionHandler('seekto', (e) => {
        if (e.seekTime) {
          handleSeekTo(e.seekTime)
        }
      })
      navigator.mediaSession.setActionHandler('seekforward', () => handleForward())
      navigator.mediaSession.setActionHandler('seekbackward', () => handleBackward())
    }
  }, [handleBackward, handleForward, handlePause, handlePlay, handleSeekTo])

  return (
    <div
      className={css`
        display: flex;
        flex-direction: column;
        width: 80%;
        align-items: center;
      `}
    >
      <div
        className={css`
          color: #fff;
          font-size: 1.2rem;
          font-weight: 600;
          text-align: center;
        `}
      >
        {props.title}
      </div>
      <div
        className={css`
          color: ${props.themeColor};
          font-size: 1.1rem;
          font-weight: 500;
          text-align: center;
        `}
      >
        {props.podcastName}
      </div>
      <div
        className={css`
          display: flex;
          justify-content: space-between;
          color: #fff;
          width: 100%;
          margin-top: 15px;
        `}
      >
        <div>{playedTime}</div>
        <div>-{leftTime}</div>
      </div>
      <ProgressBar
        progress={playedProgress}
        margin={{ top: 5 }}
        onSeekBegin={() => setIsSeeking(true)}
        onSeekEnd={() => setIsSeeking(false)}
        onSeek={(newProgress) => {
          if (audioPlayerRef.current) {
            setPlayedProgress(newProgress)
            debouncedSeekTo(audioPlayerRef.current.duration * newProgress)
          }
        }}
      />
      <ControlButtons
        themeColor={props.themeColor}
        isPlayable={isPlayable}
        margin={{ top: 20 }}
        isPlaying={isPlaying}
        playSpeed={playSpeed}
        playSpeedSelections={props.playSpeedSelections}
        onPlaySpeedChange={handlePlaySpeedChange}
        onPlayButtonClick={() => {
          if (!isPlayable) {
            toast.error('音频还未加载完毕！')
            return
          }
          if (!isPlayButtonClicked) {
            setIsPlayButtonClicked(true)
            sendHelloMessage()
          }
          if (isPlaying) {
            handlePause()
          } else {
            handlePlay()
          }
        }}
        onBackwardButtonClick={handleBackward}
        onForwardButtonClick={handleForward}
        onSyncButtonClick={handleSyncButtonClick}
      />
      <div
        className={css`
          color: #fff;
          margin-top: 15px;
        `}
      >
        {connectionStatus}
      </div>
      <audio
        controls={false}
        preload="auto"
        autoPlay={false}
        ref={audioPlayerRef}
        onTimeUpdate={(e) => {
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
        onRateChange={(e) => {
          setPlaySpeed((e.target as HTMLAudioElement).playbackRate)
        }}
        onEnded={() => {
          setIsPlaying(false)
        }}
      ></audio>
    </div>
  )
}

PodcastPlayer.defaultProps = {
  playSpeedSelections: [0.5, 0.8, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0, 2.5],
}

export default PodcastPlayer
