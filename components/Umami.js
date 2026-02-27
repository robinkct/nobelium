import { useEffect } from 'react'
import { useRouter } from 'next/router'

const Umami = () => {
    const router = useRouter()
    useEffect(() => {
        const handleRouteChange = url => {
            if (typeof window !== 'undefined' && window.umami) {
                window.umami.track((props) => ({
                    ...props,
                    url: `${window.location.hostname}${url}`
                }))
            }
        }

        // Trigger on first load
        handleRouteChange(router.asPath)

        router.events.on('routeChangeComplete', handleRouteChange)
        return () => {
            router.events.off('routeChangeComplete', handleRouteChange)
        }
    }, [router.events, router.asPath])
    return null
}
export default Umami
