module feather.strings {

    import deepValue  = feather.objects.deepValue

    export function format(str: string, obj: any): string {
        return str.replace(/{{.*?}}/g, (m) => {
            return deepValue(obj, m.substring(2, m.length - 2))
        })
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
