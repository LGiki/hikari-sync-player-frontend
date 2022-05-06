import { ReactNode } from 'react'
import { css } from '@emotion/css'
import { ASSETS_BASE_URL } from '../util/constants'

function Modal(props: { isVisible: boolean; children?: ReactNode; onNegative?: () => void }) {
  return props.isVisible ? (
    <div
      className={css`
        width: 100vw;
        height: var(--app-height);
        position: absolute;
        z-index: 100;
        display: flex;
        align-items: center;
        justify-content: center;
      `}
    >
      <div
        className={css`
          position: absolute;
          z-index: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(5px);
        `}
        onClick={props.onNegative}
      />
      <div
        className={css`
          background-color: #fff;
          position: relative;
          border-radius: 10px;
          display: flex;
          flex-direction: column;
        `}
      >
        <div
          className={css`
            width: 100%;
            display: flex;
            justify-content: flex-end;
          `}
        >
          <img
            alt="Close"
            title="Close"
            src={`${ASSETS_BASE_URL}/icons/close.svg`}
            className={css`
              width: 22px;
              height: 22px;
              cursor: pointer;
              margin-top: 8px;
              margin-right: 8px;
            `}
            onClick={props.onNegative}
          />
        </div>
        <div
          className={css`
            padding: 2px 25px 25px 25px;
          `}
        >
          {props.children}
        </div>
      </div>
    </div>
  ) : (
    <></>
  )
}

export default Modal
