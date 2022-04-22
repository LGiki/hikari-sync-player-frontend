import {css} from "@emotion/css";
import {KeyboardEvent} from 'react';

function Input(props: {
    placeholder?: string
    margin?: {
        top?: number
        right?: number
        bottom?: number
        left?: number
    }
    enterKeyHint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send'
    value?: string
    onChange?: (newValue: string) => void
    onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void
}) {
    return <input
        value={props.value}
        onKeyDown={props.onKeyDown}
        onChange={(e) => props.onChange && props.onChange(e.target.value)}
        placeholder={props.placeholder}
        enterKeyHint={props.enterKeyHint}
        className={css`
          border: 0;
          border-radius: 3px;
          padding: 8px 15px;
          background-color: #f3f2f8;
          outline: none;
          -webkit-appearance: none;
          font-size: 1rem;
          color: #626264;
          margin-top: ${props.margin?.top || 0}px;
          margin-right: ${props.margin?.right || 0}px;
          margin-bottom: ${props.margin?.bottom || 0}px;
          margin-left: ${props.margin?.left || 0}px;

          &::placeholder {
            color: #bdbcc2;
          }
        `}
    >

    </input>
}

export default Input
