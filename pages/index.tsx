import type {NextPage} from 'next'
import Button from "../components/button"
import {css, keyframes} from "@emotion/css"
import Input from "../components/input"
import CosmosLines from "../components/cosmos-lines";

const heartAnimation = keyframes`
  0%, 100% {
    transform: scale(1)
  }

  10%, 30% {
    transform: scale(0.9)
  }

  20%, 40%, 60%, 80% {
    transform: scale(1.1)
  }

  50%, 70% {
    transform: scale(1.1)
  }
`

const Home: NextPage = () => {
    return (
        <div
            className={css`
              height: var(--app-height);
              width: 100vw;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            `}
        >
            <div
                className={css`
                  flex: 1;
                  height: 0;
                  width: 100%;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                `}
            >
                <div
                    className={css`
                      position: absolute;
                      top: 0;
                      left: 0;
                      width: 100%;
                      z-index: -1;
                    `}
                >
                    <CosmosLines/>
                </div>
                <div className={css`
                  display: flex;
                  flex-direction: column;
                  width: 80%;
                `}>
                    <div className={css`
                      text-align: center;
                      font-size: 1.6rem;
                      font-weight: 500;
                      color: var(--theme-color);
                    `}>
                        ✨ Hikari Listen Together
                    </div>
                    <Input margin={{top: 10}} placeholder='https://'/>
                    <Button margin={{top: 10}}>确定</Button>
                </div>
            </div>
            <footer
                className={css`
                  color: var(--dark-text);
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  margin-bottom: 5px;
                  font-size: .9rem;
                `}
            >
                <p>请在上方填入小宇宙单集链接</p>
                <p>Made with
                    <span
                        className={css`
                          display: inline-block;
                          animation: ${heartAnimation} 1.33s ease-in-out infinite;
                          margin: 0 5px;
                        `}>
                        💙
                    </span>
                    by LGiki
                </p>
            </footer>
        </div>
    )
}

export default Home
