module feather.media {

    import collectAnnotationsFromArray = feather.objects.collectAnnotationsFromArray

    export interface MediaConfig {
        query: string,
        method: string
    }

    let mediaHandlers = new WeakMap<MediaAware, MediaConfig[]>()

    interface Listener {
        mediaQuery: MediaQueryList,
        listener: MediaQueryListListener
    }

    let mediaQueryListeners = new WeakMap<MediaAware, Listener[]>()

    export class MediaAware {

        attachMediaListeners() {
            let handlers = collectAnnotationsFromArray(mediaHandlers, this)

            handlers.forEach(h => {
                const mq = window.matchMedia(h.query),
                      listener = (mq: MediaQueryList) => {
                        if (mq.matches) {
                            this[h.method].call(this, mq)
                        }
                      }
                mq.addListener(listener);

                let dereg = mediaQueryListeners.get(this);
                if (!dereg) {
                    mediaQueryListeners.set(this, dereg = [])
                }
                dereg.push({
                    mediaQuery: mq,
                    listener
                })
            })
        }

        cleanUp() {
            let dereg = mediaQueryListeners.get(this);
            if (dereg) {
                dereg.forEach(l => l.mediaQuery.removeListener(l.listener))
            }
        }
    }

    export let Media = (query: string) => (proto: MediaAware, method: string) => {
        let handlers = mediaHandlers.get(proto)

        if (!handlers) {
            mediaHandlers.set(proto, handlers = [] as MediaConfig[])
        }

        handlers.push({
            method: method,
            query: query
        })
    }
}

