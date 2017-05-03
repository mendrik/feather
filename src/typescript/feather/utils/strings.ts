module feather.strings {

    import SimpleMap  = feather.types.SimpleMap
    import deepValue  = feather.objects.deepValue
    import isFunction = feather.functions.isFunction

    export function format(str: string, obj: any, filterLib?: any): string {
        let splits = str.split(/{{|}}/),
            l = splits.length,
            res = new Array(l),
            current
        for (let i = 0; i < l; i++) {
            current = splits[i]
            if (i % 2) {
                let filters = current.split(/:/),
                    key = filters.shift(),
                    resolved = ~key.indexOf('.') ? deepValue(obj, key) : obj[key]
                for (let f of filters) {
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
        let matches = regex.exec(text)
        if (!matches) {
            return
        }
        return matches.reduce((result, match, index) => {
            if (index > 0) {
                result[matchNames[index - 1]] = match;
            }
            return result
        }, {});
    }
}
