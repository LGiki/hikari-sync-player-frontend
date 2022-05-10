import { css } from '@emotion/css'
import { KeyboardEvent, MutableRefObject } from 'react'
import { ASSETS_BASE_URL } from '../util/constants'
import Image from "next/image";

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
  onClearClick?: () => void
  inputRef?: MutableRefObject<HTMLInputElement | null>
}) {
  return (
    <div
      className={css`
        margin-top: ${props.margin?.top || 0}px;
        margin-right: ${props.margin?.right || 0}px;
        margin-bottom: ${props.margin?.bottom || 0}px;
        margin-left: ${props.margin?.left || 0}px;
        width: 100%;
        display: flex;
        border-radius: 3px;
        padding: 8px 15px;
        background-color: #f3f2f8;
        align-items: center;
      `}
    >
      <input
        ref={props.inputRef}
        value={props.value}
        onKeyDown={props.onKeyDown}
        onChange={(e) => props.onChange && props.onChange(e.target.value)}
        placeholder={props.placeholder}
        enterKeyHint={props.enterKeyHint}
        style={props.value?.length !== 0 ? {marginRight: 8} : undefined}
        className={css`
          flex: 1;
          border: 0;
          outline: none;
          -webkit-appearance: none;
          background-color: transparent;
          font-size: 1rem;
          color: #626264;

          &::placeholder {
            color: #bdbcc2;
          }
        `}
      />
      {props.value?.length !== 0 && (
        <Image
          width={16}
          height={16}
          alt="Clear"
          title="Clear"
          src={`${ASSETS_BASE_URL}/icons/clear.svg`}
          className={css`
            cursor: pointer;
          `}
          onClick={props.onClearClick}
        />
      )}
    </div>
  )
}

export default Input
