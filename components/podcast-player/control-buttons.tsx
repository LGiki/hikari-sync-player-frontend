import {css, keyframes} from "@emotion/css";
import {ASSETS_BASE_URL} from "../../util/constants";

const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
`

function ControlButtons(props: {
    isPlayable: boolean
    isPlaying: boolean
    onBackwardClick: () => void
    onPlayClick: () => void
    onForwardClick: () => void
    margin?: {
        top?: number
        right?: number
        bottom?: number
        left?: number
    }
}) {
    return <div className={css`
      display: flex;
      justify-content: center;
      align-items: center;
      margin-top: ${props.margin?.top || 0}px;
      margin-right: ${props.margin?.right || 0}px;
      margin-bottom: ${props.margin?.bottom || 0}px;
      margin-left: ${props.margin?.left || 0}px;

      & img {
        cursor: pointer;
      }

      & img:not(:first-child) {
        margin-left: 30px;
      }
    `}>
        <img
            height={50}
            alt='Backward 15 seconds'
            title='Backward 15 seconds'
            src={`${ASSETS_BASE_URL}/icons/backward.15.svg`}
            onClick={props.onBackwardClick}
        />
        <img
            height={80}
            alt='Play'
            title={props.isPlayable ? (props.isPlaying ? 'Pause' : 'Play') : 'Loading'}
            src={`${ASSETS_BASE_URL}/icons/${props.isPlayable ? (props.isPlaying ? 'pause' : 'play') : 'loading'}.svg`}
            onClick={props.onPlayClick}
            className={!props.isPlayable ? css`
              animation: ${rotate} 6s linear infinite;
            ` : ''}
        />
        <img
            height={50}
            alt='Forward 30 seconds'
            title='Forward 30 seconds'
            src={`${ASSETS_BASE_URL}/icons/forward.30.svg`}
            onClick={props.onForwardClick}
        />
    </div>
}

export default ControlButtons
