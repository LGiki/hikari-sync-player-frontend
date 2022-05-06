import { css, keyframes } from '@emotion/css'
import { ASSETS_BASE_URL } from '../../util/constants'

const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
`

function ControlButtons(props: {
  themeColor: string
  isPlayable: boolean
  isPlaying: boolean
  playSpeed: number
  playSpeedSelections: number[]
  onPlaySpeedChange: (newPlaySpeed: number) => void
  onBackwardClick: () => void
  onPlayClick: () => void
  onForwardClick: () => void
  onSyncToEveryOneClick: () => void
  margin?: {
    top?: number
    right?: number
    bottom?: number
    left?: number
  }
}) {
  return (
    <div
      className={css`
        display: flex;
        width: 100%;
        max-width: 400px;
        justify-content: space-between;
        align-items: center;
        margin-top: ${props.margin?.top || 0}px;
        margin-right: ${props.margin?.right || 0}px;
        margin-bottom: ${props.margin?.bottom || 0}px;
        margin-left: ${props.margin?.left || 0}px;

        & img {
          cursor: pointer;
        }
      `}
    >
      <select
        className={css`
          appearance: none;
          outline: 0;
          border: 0;
          color: ${props.themeColor};
          background-color: transparent;
          background-image: none;
          cursor: pointer;
          font-size: 1.1rem;
          font-weight: 500;
        `}
        value={props.playSpeed}
        onChange={(e) => props.onPlaySpeedChange(parseFloat(e.target.value))}
      >
        {props.playSpeedSelections.map((item) => (
          <option key={item} value={item}>
            {item.toFixed(1)}x
          </option>
        ))}
      </select>
      <img
        height={50}
        alt="Backward 15 seconds"
        title="Backward 15 seconds"
        src={`${ASSETS_BASE_URL}/icons/backward.15.svg`}
        onClick={props.onBackwardClick}
      />
      <img
        height={65}
        alt="Play"
        title={props.isPlayable ? (props.isPlaying ? 'Pause' : 'Play') : 'Loading'}
        src={`${ASSETS_BASE_URL}/icons/${
          props.isPlayable ? (props.isPlaying ? 'pause' : 'play') : 'loading'
        }.svg`}
        onClick={props.onPlayClick}
        className={
          !props.isPlayable
            ? css`
                animation: ${rotate} 6s linear infinite;
              `
            : ''
        }
      />
      <img
        height={50}
        alt="Forward 30 seconds"
        title="Forward 30 seconds"
        src={`${ASSETS_BASE_URL}/icons/forward.30.svg`}
        onClick={props.onForwardClick}
      />
      <img
        width={25}
        height={25}
        alt="Sync"
        title="将当前进度同步给所有人"
        src={`${ASSETS_BASE_URL}/icons/sync.svg`}
        className={css`
          cursor: pointer;
        `}
        onClick={props.onSyncToEveryOneClick}
      />
    </div>
  )
}

export default ControlButtons
