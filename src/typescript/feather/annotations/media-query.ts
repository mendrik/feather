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

    let mediaHandlers = new WeakMap<MediaQueryAware, MediaConfig[]>()
    let mediaQueryListeners = new WeakMap<MediaQueryAware, MediaListener[]>()

    export class MediaQueryAware {

        attachMediaListeners() {
            let handlers = collectAnnotationsFromArray(mediaHandlers, this)

            handlers.forEach(h => {
                const mq = window.matchMedia(h.query),
                      listener = (mq: MediaQueryList) => {
                        if (mq.matches) {
                            this[h.method].call(this, mq)
                        }
                      }
                mq.addListener(listener)

                let dereg = mediaQueryListeners.get(this);
                if (!dereg) {
                    mediaQueryListeners.set(this, dereg = [])
                }
                dereg.push({
                    mediaQuery: mq,
                    listener
                })

                listener(mq)
            })
        }

        cleanUp() {
            let dereg = mediaQueryListeners.get(this);
            if (dereg) {
                dereg.forEach(l => l.mediaQuery.removeListener(l.listener))
            }
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

