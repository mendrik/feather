module feather.arrays {

    type MethodKey = 'sort' | 'splice'

    const observers = new WeakMap<any[], ArrayListener<any>[]>()

    export interface ArrayListener<T> {
        sort(indices: number[])
        splice(start: number, deleteCount: number, items: T[], deleted: T[])
    }

    export function from<T>(object: any): T[] {
        return [].slice.call(object)
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
        const old       = arr[key],
              listeners = observers.get(arr),
              notifyListenersWithArgs = (arr, method: MethodKey, args: any[]) => {
                for (const listener of listeners) {
                    listener[method].apply(arr, args)
                }
            }

        if (key === 'splice') {
            // add docs that removing and re-adding elements to the same array kills event listeners
            arr.splice = (index, dels, ...adds) => {
                const res = old.call(arr, index, dels, ...adds)
                notifyListenersWithArgs(arr, key, [index, dels, adds, res])
                return res
            }
        } else if (key === 'sort') {
            arr.sort = (cmp) => {
                // sort is a special case, we need to inform listeners how sorting has changed the array
                const indices = range(0, arr.length - 1),
                      args = cmp ? [arr.map((e, i) => i).sort((a, b) => cmp(arr[a], arr[b])).map(e => indices[e])] : indices,
                      res = old.call(arr, cmp)
                notifyListenersWithArgs(arr, key, args)
                return res
            }
        }
    }

    export let notifyListeners = (source: any[]) => {
        const listeners = observers.get(source)
        if (listeners) {
            for (const l of listeners) {
                l.splice(0, 0, [], [])
            }
        }
    }

    export function diff<T>(arr1: T[], arr2: T[]): T[] {
        return arr1.filter(x => !~arr2.indexOf(x))
    }

    export interface Patch<T> {
        add: T[],
        remove: T[]
    }

    export function patch<T>(target: T[], current: T[]): Patch<T> {
        return {
            add: diff(target, current),
            remove: diff(current, target)
        }
    }

    export function range(start: number, end: number): number[] {
        const len = end - start + 1,
              arr = new Array<number>(len)
        for (let i = 0, l = arr.length; i < l; i++) {
            arr[i] =  i + start
        }
        return arr
    }

    // essentially we can reduce array modifying functions to two implementations: sort and splice
    export function observeArray<T>(arr: T[], listener: ArrayListener<T>) {
        if (!observers.get(arr)) {
            observers.set(arr, [])
            arr.pop = function(): T {
                return arr.splice(arr.length - 1, 1)[0]
            }
            arr.push = function(...items: T[]): number {
                arr.splice(arr.length, 0, ...items)
                return arr.length
            }
            arr.fill = function(): T[] {
                throw Error('observed arrays cannot be filled. items must be unique, use Array.splice instead!')
            }
            arr.reverse = function() {
                const ref = arr.slice();
                arr.sort((a, b) => ref.indexOf(b) - ref.indexOf(a))
                return arr;
            }
            arr.shift = function(): T {
                return arr.splice(0, 1)[0]
            }
            arr.unshift = function(...items: T[]): number {
                arr.splice(0, 0, ...items)
                return arr.length
            }
            createProperty('splice', arr)
            createProperty('sort', arr)
        }
        observers.get(arr).push(listener)
    }

    export function changeArrayListener(cb: () => any): ArrayListener<any> {
        return {
            sort:    cb,
            splice:  cb
        }
    }

    export function lis(x: number[]) {
        const n = x.length,
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
        let cnt = len[bi]
        const res = new Array(cnt)
        for (let i = bi; i !== -1; i = pred[i]) {
            res[--cnt] = x[i]
        }
        return res
    }
}
