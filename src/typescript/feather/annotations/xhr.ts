module feather.xhr {

    import TypedMap  = feather.types.TypedMap
    import Widget    = feather.core.Widget
    import format    = feather.strings.format
    import deepValue = feather.objects.deepValue
    import isFunction = feather.functions.isFunction;

    export type MethodValue = 'GET' | 'POST' | 'DELETE' | 'PUT'

    export const Method = {
        GET:    'GET'    as MethodValue,
        POST:   'POST'   as MethodValue,
        DELETE: 'DELETE' as MethodValue,
        PUT:    'PUT'    as MethodValue
    }

    export type StringFactory = () => string

    export interface RestConfig {
        url:              string
        method?:          MethodValue
        timeout?:         number
        async?:           boolean
        responseFilter?:  (data: string) => any
        requestFilter?:   (data: string) => any
        progress?:        (ev: ProgressEvent) => any
        withCredentials?: boolean
        body?:            string
        headers?:         TypedMap<string|StringFactory>
    }

    const defaultRestConfig = {
        url:             null,
        method:          Method.GET,
        timeout:         5000,
        async:           true,
        withCredentials: true,
        responseFilter:  (data) => !!data ? JSON.parse(data) : null,
        requestFilter:   (data) => !!data ? JSON.stringify(data) : null,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=utf-8'
        }
    } as RestConfig

    export let sendRequest = (conf: RestConfig, success: (data) => void, error: (err: string|Event, xhr?: XMLHttpRequest) => void) => {
        let xhr = new XMLHttpRequest()

        conf = {...defaultRestConfig, ...conf}

        xhr.open(conf.method, conf.url, conf.async)

        xhr.timeout = conf.timeout

        if (xhr.setRequestHeader) {
            for (let key of Object.keys(conf.headers)) {
                xhr.setRequestHeader(key, conf.headers[key] as string)
            }
        }

        xhr.addEventListener('readystatechange', () => {
            if (xhr.readyState === 4) {
                const status = ~~(xhr.status/100);
                if (status === 2 || status === 3) {
                    success(conf.responseFilter(xhr.responseText))
                } else {
                    error(conf.responseFilter(xhr.responseText), xhr)
                }
            }
        })

        for (let ev of ['timeout', 'error', 'abort']) {
            xhr.addEventListener(ev, (ev: Event) => {
                error(ev)
            })
        }

        if (conf.progress) {
            xhr.addEventListener('progress', conf.progress, false)
        }

        xhr.send(conf.requestFilter(conf.body))

        return xhr;
    }

    export let Rest = (params: RestConfig) => (proto: Widget, method: string, desc: PropertyDescriptor) => {
        let original = desc.value

        desc.value = function() {
            let paramsCopy = {
                ...params,
                progress: (ev) => this.triggerDown('xhr-progress', ev)
            }
            if (paramsCopy.body) {
                paramsCopy = {
                    ...paramsCopy,
                    body: deepValue(this, params.body),
                }
            }
            if (params.headers) {
                const headers = Object.keys(params.headers).reduce((p, c) => {
                    const old = params.headers[c]
                    p[c] = isFunction(old) ? (old as StringFactory)() : old as string
                    return p
                }, {})
                paramsCopy = {
                    ...paramsCopy,
                    headers
                }
            }
            let newParams = {...paramsCopy, url: format(params.url, this, this)} // resolve url params
            return sendRequest(newParams, desc.value.original.bind(this), (err, xhr) => {
                if (xhr && xhr.status) {
                    this.triggerDown('xhr-failure-'+xhr.status, err, xhr)
                } else {
                    let type = (err as Event).type
                    this.triggerDown('xhr-failure-' + type)
                }
            })
        }

        desc.value.original = original
    }
}
