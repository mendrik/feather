---
date: 2017-08-06T21:07:13+01:00
title: Frequently asked questions
---
## Why is there no virtual dom?

A virtual dom implementation provides many benefits like universal javascript
and it makes it easy to update only parts of the DOM that have really changed.
This can be quite tricky to keep track in a framework, since many listeners 
update the same data in several places. So when the object changes frameworks
need to figure out which in the bindings has actually changed. Feather goes
the extra mile and does exactly that. As a result it doesn't have to keep a
redundant state of the DOM in memory and can update it synchronously which
allows you to write tests against the real DOM and you don't need to work 
around the framework's rendering loops with setTimeout hacks.

## What about SEO?

You can use solutions like prerender.io for now and there might be a plugin
for virtual dom in the future. At this point we want to keep things simple
so one can use feather also as a jquery replacement for example.

## How do I access parent component data in a child component?

Just add ```@Bind({bequeath: true) myprop``` to your parent component and bind 
this property in the child's template via ```{{myprop}}```

## How about callback handlers or other data?

You can either pass them down with attributes in your template using *single*
curly braces ```<child callback={onChangeSomething}/>``` or you can utilize
the internal message hub with ```this.triggerDown('xy', data)``` and 
```@Subscribe('xy') onData(data: any) {}```

## How do I add localization to my components?

Create a singleton component ```@Construct({singleton: true})``` that holds a 
messages map with a method ```translate = (key: string) => this.translations[key]```.
Then in any other component you can use with @Bind annotated keys in your template 
```{{mykey:translate}}```. Usually the transformer methods live on the instance
that holds the template, but if they are not found from there feather will try
to resolve them from singletons too.

## How can I render a component differently for mobile and desktop

An example: 

```typescript
module feather.docs {
    import Widget = feather.core.Widget
    import Template = feather.annotations.Template
    import Construct = feather.annotations.Construct
    import Media = feather.media.Media

    @Construct({selector: '.responsive'})
    export class Responsive extends Widget {

        @Media('(max-width: 768px)')
        renderMobile() {
            // usually widgets append themselves only, 
            // if you need to clear out the previous content
            // pass true as the second argument
            this.render('mobile', true) 
        }

        @Media('(min-width: 769px)')
        renderDesktop() {
            this.render('desktop', true)
        }

        @Template('mobile')
        markupMobile() {
            return `Mobile version`
        }

        @Template('desktop')
        markupDesktop() {
            return `Desktop version`
        }
    }
}
```
Try it out by resizing your browser window

<div class="responsive demo"></div>


