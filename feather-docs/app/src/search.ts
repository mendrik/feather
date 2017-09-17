module feather.docs {


    import Widget = feather.core.Widget;
    import Construct = feather.annotations.Construct;
    import On = feather.event.On;
    import format = feather.strings.format;

    const searchUrl = 'https://github.com/mendrik/feather/issues?utf8=%E2%9C%93&q=is%3Aissue%20{{search}}'

    @Construct({selector: '#search'})
    class Search extends Widget {

        @On({event: 'keypress'})
        onEnter(ev: KeyboardEvent, el: HTMLInputElement) {
            if (ev.keyCode === 13) {
                document.location.href = format(searchUrl, {search: el.value})
            }
        }

    }
}
