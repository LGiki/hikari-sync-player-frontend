import {css} from '@emotion/css'

function Button(props: {
    onClick?: () => void
    children?: string
    margin?: {
        top?: number
        right?: number
        bottom?: number
        left?: number
    }
}) {
    return <button
        className={css`
          padding: 8px 15px;
          border: 0;
          border-radius: 3px;
          background-color: var(--theme-color);
          color: #fff;
          font-size: 1rem;
          cursor: pointer;
          margin-top: ${props.margin?.top || 0}px;
          margin-right: ${props.margin?.right || 0}px;
          margin-bottom: ${props.margin?.bottom || 0}px;
          margin-left: ${props.margin?.left || 0}px;
          transition: background-color 0.1s linear;
          user-select: none;

          &:active {
            background-color: var(--theme-color-lighten);
          }
        `}
        onClick={props.onClick}
    >
        {props.children}
    </button>
}

export default Button
