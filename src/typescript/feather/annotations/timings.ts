module feather.timings {

    function debounce(fn, delay) {
        let timer = null
        return function () {
            let context = this,
                args = arguments
            clearTimeout(timer)
            timer = setTimeout(() => {
                fn.apply(context, args)
            }, delay);
        };
    }

    export let Debounce = (delayInMs: number) => (proto: any, method: string) => {
        let old = proto[method];
        proto[method] = debounce(old, delayInMs);
    }

    export let AnimationFrame = () => (proto: any, method: string) => {
        requestAnimationFrame(proto[method])
    }
}
