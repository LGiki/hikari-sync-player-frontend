import Document, {Html, Head, Main, NextScript, DocumentContext, DocumentInitialProps} from "next/document";
import createEmotionServer from '@emotion/server/create-instance';
import {cache} from '@emotion/css';
import * as React from 'react'

const renderStatic = async (html: string) => {
    const {extractCritical} = createEmotionServer(cache)
    const {ids, css} = extractCritical(html)
    return {html, ids, css}
}

export default class MyDocument extends Document {
    static async getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps> {
        const page = await ctx.renderPage()
        const {css, ids} = await renderStatic(page.html)
        const initialProps = await Document.getInitialProps(ctx)

        return {
            ...initialProps,
            // See <https://github.com/vercel/next.js/issues/36008>.
            styles: [
                <React.Fragment key="1">
                    {initialProps.styles}
                    <style
                        data-emotion={`css ${ids.join(' ')}`}
                        // eslint-disable-next-line react/no-danger
                        dangerouslySetInnerHTML={{__html: css}}
                    />
                </React.Fragment>,
            ],
        }
    }

    render(): JSX.Element {
        return (
            <Html lang="zh-Hans">
                <Head>
                    <meta charSet="UTF-8" />
                    <meta name="application-name" content="Hikari Listen Together"/>
                    <meta name="apple-mobile-web-app-title" content="Hikari Listen Together"/>
                    <meta name="apple-mobile-web-app-capable" content="yes"/>
                    <meta name="apple-touch-fullscreen" content="yes"/>
                    <meta name="apple-mobile-web-app-status-bar-style" content="default"/>
                    <meta name="format-detection" content="telephone=no" />
                    <meta name="mobile-web-app-capable" content="yes" />
                    <link rel="manifest" href="/manifest.json" />
                    <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png"/>
                    <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-icon-180.png"/>
                    <meta name="nightmode" content="disable"/>
                    <meta name="color-scheme" content="light only"/>
                    <meta name="renderer" content="webkit"/>
                    <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
                </Head>
                <body>
                <Main/>
                <NextScript/>
                </body>
            </Html>
        )
    }
}
