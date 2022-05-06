import { GetServerSidePropsContext } from 'next'
import { css } from '@emotion/css'
import { API_BASE_URL } from '../../../util/constants'

function VideoPlayer(props: { url: string }) {
  return (
    <div>
      <video
        className={css`
          height: var(--app-height);
          width: 100vw;
        `}
        crossOrigin={'anonymous'}
        src={props.url}
        preload="auto"
        controls={true}
        autoPlay={false}
      />
    </div>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { id } = context.query
  const data = await fetch(`${API_BASE_URL}/room/${id}`)
    .then((res) => res.json())
    .catch((err) => console.log(err))
  if (!data || data.code !== 200) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }
  return {
    props: {
      ...data.data.mediaData,
    },
  }
}

export default VideoPlayer
