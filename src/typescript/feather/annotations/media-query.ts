module feather.media {

    import collect = feather.objects.collectAnnotationsFromArray
    import ensure  = feather.functions.ensure;

    export interface MediaConfig {
        query: string,
        method: string
    }

    interface MediaListener {
        mediaQuery: MediaQueryList,
        listener: MediaQueryListListener
    }

    const mediaHandlers = new WeakMap<MediaQueryAware, MediaConfig[]>()
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

                let deregistry = mediaQueryListeners.get(this)
                if (!deregistry) {
                    mediaQueryListeners.set(this, deregistry = [])
                }
                deregistry.push({
                    mediaQuery: mq,
                    listener
                })

                listener(mq)
            })
        }

        cleanUp() {
            (mediaQueryListeners.get(this) || [])
                .forEach(l => l.mediaQuery.removeListener(l.listener))
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

