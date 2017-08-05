module feather.strings {

    import deepValue  = feather.objects.deepValue
    import isFunction = feather.functions.isFunction

    export function format(str: string, obj: any, filterLib?: any): string {
        const splits = str.split(/{{|}}/),
              l = splits.length,
              res = new Array(l)
        let current
        for (let i = 0; i < l; i++) {
            current = splits[i]
            if (i % 2) {
                const filters = current.split(/:/),
                      key = filters.shift()
                let resolved = ~key.indexOf('.') ? deepValue(obj, key) : obj[key]
                for (const f of filters) {
                    resolved = filterLib[f].call(obj, resolved)
                }
                if (typeof resolved === 'undefined') {
                    return res[i] = `{{${current}}}`
                }
                res[i] = isFunction(resolved) ? resolved.call(obj) : resolved
            } else {
                res[i] = current
            }
        }
        return res.join('')
    }

    export function namedRegexMatch(text, regex, matchNames) {
        const matches = regex.exec(text)
        if (!matches) {
            return
        }
        return matches.reduce((result, match, index) => {
            if (index > 0) {
                result[matchNames[index - 1]] = match
            }
            return result
        }, {})
    }
}
