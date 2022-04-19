import {css} from "@emotion/css";
import QRCode from "react-qr-code";
import Modal from "./modal";

function ShareLinkModal(props: {
    isVisible: boolean
    url: string
    onNegative?: () => void
}) {
    return <Modal
        isVisible={props.isVisible}
        onNegative={props.onNegative}
    >
        <div className={css`
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              color: var(--dark-text);

              & *:not(:first-child) {
                margin-top: 5px;
              }
            `}>
            <p>请将该二维码分享给一起听的朋友：</p>
            <QRCode value={props.url}/>
            <p>或将该链接分享给一起听的朋友：</p>
            <input
                className={css`
                      color: var(--dark-text);
                      width: 100%;
                    `}
                value={props.url}
                onClick={e => (e.target as HTMLInputElement).select()}
            />
        </div>
    </Modal>
}

export default ShareLinkModal