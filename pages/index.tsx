import type { NextPage } from 'next'
import Button from '../components/button'
import { css, keyframes } from '@emotion/css'
import Input from '../components/input'
import CosmosLines from '../components/cosmos-lines'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { API_BASE_URL, WEBSITE_TITLE } from '../util/constants'

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
  const [url, setUrl] = useState('')
  const router = useRouter()
  const urlInputRef = useRef<HTMLInputElement | null>(null)

  // Autofocus to url input when page loaded
  useEffect(() => {
    urlInputRef.current?.focus()
  }, [])

  const handleCreateRoom = useCallback(() => {
    if (url.length === 0) {
      toast.error('请输入链接')
      return
    }

    if (!url.startsWith('https://') && !url.startsWith('http://')) {
      toast.error('请检查输入链接是否正确')
      return
    }

    if (url.includes('xiaoyuzhoufm.com') && !url.includes('xiaoyuzhoufm.com/episode')) {
      toast.error('请输入小宇宙单集链接')
      return
    }

    if (url.includes('cowtransfer.com') && !url.includes('cowtransfer.com/s')) {
      toast.error('请输入奶牛快传分享链接')
      return
    }

    fetch(`${API_BASE_URL}/room`, {
      method: 'POST',
      body: JSON.stringify({
        url: url,
      }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json['code'] !== 200) {
          toast.error(`错误：${json['msg']}`)
        } else {
          router.push(`/player/${json['data']['type']}/${json['data']['roomId']}`)
        }
      })
      .catch(() => {
        toast.error('发送请求失败，请稍后再试')
      })
  }, [router, url])

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
      <Head>
        <title>{WEBSITE_TITLE}</title>
      </Head>
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
            z-index: 0;
          `}
        >
          <CosmosLines />
        </div>
        <div
          className={css`
            display: flex;
            flex-direction: column;
            width: 80%;
            z-index: 1;
          `}
        >
          <div
            className={css`
              text-align: center;
              font-size: 1.6rem;
              font-weight: 600;
              color: var(--theme-color);
            `}
          >
            {WEBSITE_TITLE}
          </div>
          <Input
            inputRef={urlInputRef}
            margin={{ top: 10 }}
            placeholder="https://"
            value={url}
            enterKeyHint="go"
            onClearClick={() => {
              setUrl('')
              urlInputRef.current?.focus()
            }}
            onChange={(newValue) => setUrl(newValue)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCreateRoom()
              }
            }}
          />
          <Button margin={{ top: 10 }} onClick={handleCreateRoom}>
            确定
          </Button>
        </div>
      </div>
      <footer
        className={css`
          color: var(--dark-text);
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 5px;
          font-size: 0.9rem;
          z-index: 1;
          line-height: 150%;
        `}
      >
        <p>
          请在上方填入
          <span
            className={css`
              box-shadow: inset 0px -5px 0 0 rgba(133, 214, 244, 0.7);
            `}
          >
            小宇宙单集链接
          </span>
          或
          <span
            className={css`
              box-shadow: inset 0 -5px 0 0 rgba(253, 218, 101, 0.7);
            `}
          >
            奶牛快传分享链接
          </span>
        </p>
        <p>
          Made with
          <span
            className={css`
              display: inline-block;
              animation: ${heartAnimation} 1.33s ease-in-out infinite;
              margin: 0 5px;
            `}
          >
            💙
          </span>
          by LGiki
        </p>
      </footer>
    </div>
  )
}

export default Home
