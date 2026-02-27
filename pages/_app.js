import 'prismjs/themes/prism.css'
import 'react-notion-x/src/styles.css'
import 'katex/dist/katex.min.css'
import App from 'next/app'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import '@/styles/globals.css'
import '@/styles/notion.css'
import dynamic from 'next/dynamic'
import loadLocale from '@/assets/i18n'
import { ConfigProvider } from '@/lib/config'
import { LocaleProvider } from '@/lib/locale'
import { prepareDayjs } from '@/lib/dayjs'
import { ThemeProvider } from '@/lib/theme'
import Scripts from '@/components/Scripts'

const Ackee = dynamic(() => import('@/components/Ackee'), { ssr: false })
const Gtag = dynamic(() => import('@/components/Gtag'), { ssr: false })
const Umami = dynamic(() => import('@/components/Umami'), { ssr: false })

export default function MyApp({ Component, pageProps, config, locale }) {
  const router = useRouter()

  useEffect(() => {
    function onRouteChangeComplete() {
      if (config?.analytics?.provider === 'umami' && window.umami) {
        window.umami.track((props) => ({
          ...props,
          url: window.location.hostname + window.location.pathname,
        }))
      }
    }

    if (config?.analytics?.provider === 'umami') {
      const trackUmami = () => {
        if (window.umami) {
          window.umami.track((props) => ({
            ...props,
            url: window.location.hostname + window.location.pathname,
          }))
        } else {
          setTimeout(trackUmami, 300)
        }
      }
      trackUmami()
    }

    router.events.on('routeChangeComplete', onRouteChangeComplete)

    return () => {
      router.events.off('routeChangeComplete', onRouteChangeComplete)
    }
  }, [router.events, config])

  return (
    <ConfigProvider value={config}>
      <Scripts />
      <LocaleProvider value={locale}>
        <ThemeProvider>
          <>
            {process.env.VERCEL_ENV === 'production' && config?.analytics?.provider === 'ackee' && (
              <Ackee
                ackeeServerUrl={config.analytics.ackeeConfig.dataAckeeServer}
                ackeeDomainId={config.analytics.ackeeConfig.domainId}
              />
            )}
            {process.env.VERCEL_ENV === 'production' && config?.analytics?.provider === 'ga' && <Gtag />}
            {process.env.VERCEL_ENV === 'production' && config?.analytics?.provider === 'umami' && <Umami />}
            <Component {...pageProps} />
          </>
        </ThemeProvider>
      </LocaleProvider>
    </ConfigProvider>
  )
}

MyApp.getInitialProps = async ctx => {
  const config = typeof window === 'object'
    ? await fetch('/api/config').then(res => res.json())
    : await import('@/lib/server/config').then(module => module.clientConfig)

  prepareDayjs(config.timezone)

  return {
    ...App.getInitialProps(ctx),
    config,
    locale: await loadLocale('basic', config.lang)
  }
}
