import {css} from "@emotion/css";
import React, {useCallback, useRef} from "react";

function ProgressBar(props: {
    progress: number
    onSeek: (newProgress: number) => void
    onSeekBegin?: () => void
    onSeekEnd?: () => void
    height?: number
    margin?: {
        top?: number
        right?: number
        bottom?: number
        left?: number
    }
}) {
    const progressBarRef = useRef<HTMLDivElement | null>(null)

    const handleProgressChange = useCallback((e: React.TouchEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>) => {
        const rect = progressBarRef.current!.getBoundingClientRect()
        const progressBarLeft = rect.left
        const progressBarWidth = rect.width
        props.onSeek((('touches' in e ? e.touches[0] : e).pageX - progressBarLeft!) / progressBarWidth!)
    }, [props])

    return <div
        ref={progressBarRef}
        onTouchStart={props.onSeekBegin}
        onTouchMove={handleProgressChange}
        onTouchEnd={props.onSeekEnd}
        onMouseDownCapture={props.onSeekBegin}
        onMouseDown={e => {
            handleProgressChange(e)
        }}
        onMouseMove={e => {
            if (e.buttons === 1) {
                handleProgressChange(e)
            }
        }}
        onMouseUpCapture={props.onSeekEnd}
        className={css`
          background-color: rgba(255, 255, 255, .15);
          position: relative;
          border-radius: 5px;
          overflow: hidden;
          width: 100%;
          height: ${props.height || 40}px;
          margin-top: ${props.margin?.top || 0}px;
          margin-right: ${props.margin?.right || 0}px;
          margin-bottom: ${props.margin?.bottom || 0}px;
          margin-left: ${props.margin?.left || 0}px;
          cursor: pointer;
        `}
    >
        <div
            style={{
                transform: `translateX(-${(1 - props.progress) * 100}%)`
            }}
            className={css`
              position: absolute;
              background-color: rgba(255, 255, 255, .7);
              height: 100%;
              width: 100%;
            `}
        />
    </div>
}

export default ProgressBar
