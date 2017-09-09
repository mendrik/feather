module feather.media {

    import collect       = feather.objects.collectAnnotationsFromArray
    import ensure        = feather.objects.ensure

    export interface MediaConfig {
        query:  string,
        method: string
    }

    interface MediaListener {
        mediaQuery: MediaQueryList,
        listener:   MediaQueryListListener
    }

    const mediaHandlers       = new WeakMap<MediaQueryAware, MediaConfig[]>()
    const mediaQueryListeners = new WeakMap<MediaQueryAware, MediaListener[]>()

    export class MediaQueryAware {

        attachMediaListeners() {
            collect(mediaHandlers, this).forEach(h => {
                const mq = window.matchMedia(h.query),
                    listener = (mq: MediaQueryList) => {
                        if (mq.matches) {
                            this[h.method].call(this, mq)
                        }
                    }
                mq.addListener(listener)

                ensure(mediaQueryListeners, this, [{
                    mediaQuery: mq,
                    listener
                }])

                listener(mq)
            })
        }

        cleanUp() {
            const listeners = mediaQueryListeners.get(this)
            if (listeners) {
                for (const l of listeners) {
                    l.mediaQuery.removeListener(l.listener)
                }
            }
        }
    }

    export const Media = (query: string) => (proto: MediaQueryAware, method: string) => {
        const handlers = ensure(mediaHandlers, proto, [])
        handlers.push({
            method: method,
            query: query
        })
    }
}

