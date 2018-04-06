module feather.xhr {

    import TypedMap         = feather.types.TypedMap
    import Widget           = feather.core.Widget
    import format           = feather.strings.format
    import deepValue        = feather.objects.deepValue
    import merge            = feather.objects.merge
    import strFactory       = feather.functions.strFactory
    import StringFactory    = feather.types.StringFactory

    export type MethodValue = 'GET' | 'POST' | 'DELETE' | 'PUT'

    export const Method = {
        GET:    'GET'    as MethodValue,
        POST:   'POST'   as MethodValue,
        DELETE: 'DELETE' as MethodValue,
        PUT:    'PUT'    as MethodValue
    }

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

    export const defaultRestConfig: RestConfig = {
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
    }

    export let sendRequest = (conf: RestConfig, success: (data) => void,
                              error: (err: string|Event, xhr?: XMLHttpRequest) => void): Promise<any> => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest()

            conf = merge({...defaultRestConfig}, conf)

            xhr.open(conf.method, conf.url, conf.async)

            xhr.timeout = conf.timeout

            if (xhr.setRequestHeader) {
                for (const key of Object.keys(conf.headers)) {
                    xhr.setRequestHeader(key, conf.headers[key] as string)
                }
            }

            xhr.addEventListener('readystatechange', () => {
                if (xhr.readyState === 4) {
                    const status = ~~(xhr.status/100)
                    const result = conf.responseFilter(xhr.responseText)
                    if (status === 2 || status === 3) {
                        success(result)
                        resolve(result)
                    }
                    else {
                        error(result, xhr)
                        reject(result)
                    }
                }
            })

            for (const ev of ['timeout', 'error', 'abort']) {
                xhr.addEventListener(ev, (ev: Event) => {
                    error(ev)
                    reject(ev)
                })
            }

            if (conf.progress) {
                xhr.addEventListener('progress', conf.progress, false)
            }

            xhr.send(conf.requestFilter(conf.body))

            return xhr
        })
    }

    export let Rest = (params: RestConfig) => (proto: Widget, method: string, desc: PropertyDescriptor) => {
        const original = desc.value

        desc.value = function() {
            const paramsCopy = {
                ...params,
                progress: (ev) => this.triggerDown('xhr-progress', ev),
                body: params.body && deepValue(this, params.body),
                headers: (params.headers &&
                    Object.keys(params.headers)
                        .reduce((p, c) => ({...p, [c]: strFactory(params.headers[c])}), {})) || {},
                url: format(params.url, this)
            }
            return sendRequest(paramsCopy, desc.value.original.bind(this), (err, xhr: XMLHttpRequest) => {
                if (xhr && xhr.status) {
                    this.triggerDown('xhr-failure-'+xhr.status, err)
                }
                else if (err) {
                    const type = (err as Event).type
                    this.triggerDown('xhr-failure-' + type)
                }
            })
        }

        desc.value.original = original
    }
}
