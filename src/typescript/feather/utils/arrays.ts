module feather.arrays {

    type MethodKey = 'reverse' | 'sort' | 'splice'

    const proxiedArrayMethods: MethodKey[] = ['reverse', 'sort', 'splice']
    const observers           = new WeakMap<any[], ArrayListener<any>[]>()

    export interface ArrayListener<T> {
        reverse()
        sort(indices: number[])
        splice(start: number, deleteCount: number, items: T[], deleted: T[])
    }

    export function from<T>(object: any): Array<T> {
        return [].slice.call(object)
    }

    export function flatMap<T, U>(array: T[], mapFunc: (x: T) => U[]): U[] {
        return array.reduce((cumulus: U[], next: T) => [...mapFunc(next), ...cumulus], [] as U[])
    }

    export function flatten(array: any[]): any[] {
        return array.reduce((a, b) => a.concat(b), [])
    }

    export function removeFromArray(arr: any[], elements: any[]) {
        for (let i = arr.length; i--;) {
            if (~elements.indexOf(arr[i])) {
                arr.splice(i, 1)
            }
        }
    }

    function createProperty<T>(key: MethodKey, arr: T[]) {
        let old       = arr[key],
            listeners = observers.get(arr)

        arr[key] = function() {
            let args: any[] = from(arguments)

            if (key === 'sort') {
                // sort is a special case, we need to inform listeners how sorting has changed the array
                let cmp = args[0],
                    indices = range(0, arr.length - 1)
                args = cmp ? [arr.map((e, i) => i).sort((a, b) => cmp(arr[a], arr[b])).map(e => indices[e])] : indices
            }

            let res = old.apply(arr, args)

            if (key === 'splice') {
                // convert splice callback to start, deleteCount, added items, deleted items
                args = [args[0], args[1], args.slice(2), res]
            }

            for (let listener of listeners) {
                if (!!listener[key]) {
                    listener[key].apply(arr, args)
                }
            }
            // todo add index setters/getters here (if possible, meanwhile use set(index, value) instead of arr[index] = value
            return res
        }
    }

    export let notifyListeners = (source: any[]) => {
        let listeners = observers.get(source);
        if (listeners) {
            for (let l of listeners){
                l.splice(0, 0, [], []);
            }
        }
    }

    export function range(start: number, end: number) {
        let len = end - start + 1,
            gen = Array.apply(null, {length: len}).map(Number.call, Number);
        return gen.map(x => x + start);
    }

    export function forgetListener<T>(arr: T[], listener: ArrayListener<T>) {
        let l = observers.get(arr),
            index
        if (l && ~(index = l.indexOf(listener))) {
            l.splice(index, 1)
        }
    }

    export function observeArray<T>(arr: T[], listener: ArrayListener<T>) {
        if (!observers.get(arr)) {
            observers.set(arr, [])
            arr.pop = function() {
                arr.splice(arr.length - 1, 1)
                return arr[arr.length - 1]
            }
            arr.push = function(...items: T[]) {
                arr.splice.apply(arr, Array.prototype.concat.call([arr.length, 0], items))
                return arr.length
            }
            arr.shift = function() {
                let deletee = arr[0]
                arr.splice(0, 1)
                return deletee
            }
            arr.unshift = function(...items: T[]) {
                arr.splice.apply(arr, Array.prototype.concat.call([0, 0], items))
                return arr.length
            }
            arr['set'] = function(index: number, item: T) {
                arr.splice.apply(arr, Array.prototype.concat.call([index, 1], [item]))
                return item;
            }
            for (let key of proxiedArrayMethods) {
                createProperty(key, arr)
            }
        }
        observers.get(arr).push(listener)
    }

    export function changeArrayListener(cb: () => any): ArrayListener<any> {
        return {
            reverse: cb,
            sort:    cb,
            splice:  cb
        } as ArrayListener<any>
    }
}
