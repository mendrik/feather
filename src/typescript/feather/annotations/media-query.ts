module feather.media {

    import collectAnnotationsFromArray = feather.objects.collectAnnotationsFromArray

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
            collectAnnotationsFromArray(mediaHandlers, this).forEach(h => {
                const mq = window.matchMedia(h.query),
                      listener = (mq: MediaQueryList) => {
                        if (mq.matches) {
                            this[h.method].call(this, mq)
                        }
                      }
                mq.addListener(listener)

                let deregistry = mediaQueryListeners.get(this);
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
        let handlers = mediaHandlers.get(proto)

        if (!handlers) {
            mediaHandlers.set(proto, handlers = [])
        }

        handlers.push({
            method: method,
            query: query
        })
    }
}

