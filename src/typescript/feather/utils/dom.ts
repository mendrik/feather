module feather.dom {

    import ValidRoot = feather.types.ValidRoot

    const _selectorMatches: (s: string) => boolean = [
        'matches',
        'webkitMatchesSelector',
        'mozMatchesSelector',
        'msMatchesSelector',
        'matchesSelector'
    ].reduce((p, c) => Element.prototype[c] || p) as any

    export function selectorMatches(el: ValidRoot, selector: string): boolean {
        return _selectorMatches.call(el, selector)
    }

    export function allChildNodes(doc: Node): Element[] {
        const walker = document.createTreeWalker(doc, NodeFilter.SHOW_ALL, null, false),
              nodes = []
        let currentNode
        do {
            currentNode = walker.currentNode
            if (currentNode.nodeType !== Node.TEXT_NODE || currentNode.textContent.trim()) {
                nodes.push(currentNode)
            }
        } while (walker.nextNode())
        return nodes
    }

    export function allTextNodes(doc: Node): Node[] {
        const a = [],
              walk = document.createTreeWalker(doc, NodeFilter.SHOW_TEXT, null, false);
        let n;
        while (n = walk.nextNode()) a.push(n);
        return a;
    }
}
