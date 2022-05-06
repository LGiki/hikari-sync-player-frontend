import { memo } from 'react'
import { css } from '@emotion/css'
import { ASSETS_BASE_URL } from '../util/constants'

export default memo(function CosmosLines() {
  return (
    <div
      className={css`
        height: 235px;
        width: 100%;
        background-image: url(${`${ASSETS_BASE_URL}/images/cosmos_line.svg`});
      `}
    />
  )
})
