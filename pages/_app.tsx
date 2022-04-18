import '../styles/globals.css'
import type {AppProps} from 'next/app'
import Head from "next/head"
import {useCallback, useEffect} from "react";
import 'react-toastify/dist/ReactToastify.css';
import {ToastContainer} from "react-toastify";

function MyApp({Component, pageProps}: AppProps) {
    // Set the value of css variable `--app-height` to window.innerHeight
    const setAppSize = useCallback(() => {
        document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`)
    }, [])

    useEffect(() => {
        setAppSize();
        window.addEventListener('resize', setAppSize)
        return () => {
            window.removeEventListener('resize', setAppSize)
        }
    }, [setAppSize])

    return <>
        <Head>
            <meta name="viewport"
                  content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, viewport-fit=cover"/>
        </Head>
        <Component {...pageProps} />
        <ToastContainer
            position="bottom-center"
            autoClose={3000}
            hideProgressBar={true}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
        />
    </>
}

export default MyApp
