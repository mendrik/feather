module feather.arrays {

    type MethodKey = 'sort' | 'splice'

    const proxiedArrayMethods: MethodKey[] = ['sort', 'splice']
    const observers           = new WeakMap<any[], ArrayListener<any>[]>()

    export interface ArrayListener<T> {
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

    function createProperty<T>(key: MethodKey, arr: any) {
        let old       = arr[key],
            listeners = observers.get(arr),
            notifyListenersWithArgs = (arr, method: MethodKey, args: any[]) => {
                for (let listener of listeners) {
                    if (!!listener[method]) {
                        listener[method].apply(arr, args)
                    }
                }
            }

        if (key === 'splice') {
            arr.splice = (index, dels, ...adds) => {
                let res = old.call(arr, index, dels, ...adds);
                notifyListenersWithArgs(arr, key, [index, dels, adds, res])
                return res;
            }
        } else if (key == 'sort') {
            arr.sort = (cmp) => {
                // sort is a special case, we need to inform listeners how sorting has changed the array
                let indices = range(0, arr.length - 1),
                    args = cmp ? [arr.map((e, i) => i).sort((a, b) => cmp(arr[a], arr[b])).map(e => indices[e])] : indices,
                    res = old.call(arr, cmp)
                notifyListenersWithArgs(arr, key, args)
                return res
            }
        }
    }

    export let notifyListeners = (source: any[]) => {
        let listeners = observers.get(source);
        if (listeners) {
            for (let l of listeners){
                l.splice(0, 0, [], [])
            }
        }
    }

    export function diff<T>(arr1: T[], arr2: T[]): T[] {
        return arr1.filter(x => !~arr2.indexOf(x));
    }

    export interface Patch<T> {
        add: T[],
        remove: T[]
    }

    export function patch<T>(target: T[], current: T[]): Patch<T> {
        return {
            add: target.filter(x => !~current.indexOf(x)),
            remove: current.filter(x => !~target.indexOf(x))
        }
    }

    export function range(start: number, end: number) {
        let len = end - start + 1,
            arr = new Array(len)
        for (let i = 0, l = arr.length; i < l; i++) {
            arr[i] =  i + start
        }
        return arr
    }

    export function observeArray<T>(arr: T[], listener: ArrayListener<T>) {
        if (!observers.get(arr)) {
            observers.set(arr, [])
            arr.pop = function() {
                arr.splice(arr.length - 1, 1)
                return arr[arr.length - 1]
            }
            arr.push = function(...items: T[]) {
                arr.splice(arr.length, 0, ...items)
                return arr.length
            }
            arr.reverse = function() {
                let ref = arr.slice();
                arr.sort((a, b) => ref.indexOf(b) - ref.indexOf(a))
                return arr;
            }
            arr.shift = function() {
                let deletee = arr[0]
                arr.splice(0, 1)
                return deletee
            }
            arr.unshift = function(...items: T[]) {
                arr.splice(0, 0, ...items)
                return arr.length
            }
            arr['set'] = function(index: number, item: T) {
                arr.splice(index, 1, item)
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
            sort:    cb,
            splice:  cb
        } as ArrayListener<any>
    }

    export function lis(x: number[]) {
        let n = x.length,
            len = new Array(n),
            pred = new Array(n)
        for (let i = 0, nn = n + 1; i < nn; i++) {
            len[i] = 1
            pred[i] = -1
        }
        for (let i = 1; i < n; i++) {
            for (let j = 0; j < i; j++) {
                if (x[j] < x[i] && len[i] < len[j] + 1) {
                    len[i] = len[j] + 1
                    pred[i] = j
                }
            }
        }
        let bi = 0
        for (let i = 1; i < n; i++) {
            if (len[bi] < len[i]) {
                bi = i
            }
        }
        let cnt = len[bi],
            res = new Array(cnt)
        for (let i = bi; i != -1; i = pred[i]) {
            res[--cnt] = x[i]
        }
        return res
    }  
}
