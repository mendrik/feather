module feather.strings {

    import SimpleMap  = feather.types.SimpleMap
    import deepValue  = feather.objects.deepValue
    import isFunction = feather.functions.isFunction

    export function format(str: string, obj: any, filterLib?: any) {
        return str.replace(/\{\{(.*?)}}/g, function (match, curly) {
            let filters = curly.split(/:/),
                key = filters.shift(),
                resolved = ~key.indexOf('.') ? deepValue(obj, key) : obj[key]
            for (let f of filters) {
                resolved = filterLib[f].call(obj, resolved)
            }
            if (typeof resolved === 'undefined') {
                return match
            }
            return isFunction(resolved) ? resolved.call(obj) : resolved
        })
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
