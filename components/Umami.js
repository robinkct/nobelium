import { useEffect } from 'react'
import { useRouter } from 'next/router'

const Umami = () => {
    const router = useRouter()
    useEffect(() => {
        const handleRouteChange = url => {
            // Umami v2 accepts an object for page views: umami.track(payload)
            // If window.umami is not yet loaded, we should wait or just let it be. 
            // The first load might be handled by Umami itself if auto-track wasn't disabled properly? 
            // Wait, we disabled auto-track, so we must send it.
            const sendTrack = () => {
                if (typeof window !== 'undefined' && window.umami) {
                    window.umami.track(props => ({
                        ...props,
                        url: `${window.location.hostname}${url}`,
                        name: 'pageview'
                    }))
                } else if (typeof window !== 'undefined') {
                    // Retry after a short delay in case script is still loading
                    setTimeout(sendTrack, 300)
                }
            }
            sendTrack()
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
