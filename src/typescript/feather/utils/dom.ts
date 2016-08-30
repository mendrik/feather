module feather.dom {

    import from      = feather.arrays.from
    import ValidRoot = feather.types.ValidRoot

    export function querySelectorWithRoot(root: ValidRoot, selector: string): Array<HTMLElement> {
        let result = []
        if (root.nodeType === 1 && selectorMatches(root, selector)) {
            result.push(root)
        }
        result.push.apply(result, root.querySelectorAll(selector))
        return result
    }

    export function selectorMatches(el: ValidRoot, selector: string): boolean {
        let elp = Element.prototype,
            f = ['matches' , 'webkitMatchesSelector', 'mozMatchesSelector', 'msMatchesSelector', 'matchesSelector']
                .reduce((p, c) => elp[c] || p) as any as (s: string) => boolean
        return f.call(el, selector)
    }

    export function allChildNodes(doc: Node) {
        let filter = (n: Node) => {
            if (n.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
                return NodeFilter.FILTER_REJECT
            } else if (n.nodeType === Node.TEXT_NODE && n.textContent.trim() === '') {
                return NodeFilter.FILTER_REJECT
            } else {
                return NodeFilter.FILTER_ACCEPT
            }
        }
        this.acceptNode = filter
        let walker = document.createTreeWalker(doc, NodeFilter.SHOW_ALL, filter as any, false),
            nodes = []
        do {
            nodes.push(walker.currentNode)
        } while (walker.nextNode())
        return nodes
    }

    export function insertBefore(parent: Node, el: Node, first?: Node) {
        parent.insertBefore(el, first || null)
    }
}
