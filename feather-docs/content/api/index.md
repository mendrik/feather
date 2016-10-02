---
date: 2016-10-01T21:07:13+01:00
title: API Documentation
weight: 20
---

## Widgets

Your application will be a collection of classes that all extend feather's Widget class. The widget class itself inherits
other classes in the following order:

```
MyWidget -> Widget -> Observable -> RouteAware -> Subscribable -> EventAware -> Object
```

### Widget

At its core a widget class is attached to a single DOM element. It holds a reference to that element, which you can access
in your class via ```this.element```. Furthermore it exposes a method ```render(templateName: string)```, which has to be 
called manually for the widget to render into its element. Feather doesn't want to make assumption when to render the 
widget; it might be required to fetch data from a server or wait for other events first. 
 
A widget usually comes with a ```@Construct({selector: string})``` class annotation, which defines which HTML elements the 
component will be attached to. Once the Widget cas been created, you can override the ```init(element: HTMLElement)``` method 
in your class and call this.render(templateName) there. The templateName is defined via ```@Template()```, which should 
decorate a method which returns a string it should render. Note the widgets don't require a constructor, and most of the 
custom initialization should be done in the overwritten ```init``` method. An exception to this are array-widgets, but more 
on this later.

You can also have different templates in the same widget class and choose which way to render the widget's data.

Putting it all together, a very simple widget might look like this:
 
```
 /// <reference path="../typings/feather.d.ts" />
 
 module demo {
 
     import Widget    = feather.core.Widget
     import Construct = feather.annotations.Construct
     import Template  = feather.annotations.Template
 
     @Construct({selector: 'body'})
     export class MyApplication extends Widget {
 
         who = 'world'   
 
         init(element: HTMLElement) {
             this.render('default')
         }
 
         @Template('default')
         protected getBaseTemplate() {
             return (`
                Hello $[this.who}!                                    
             `)
         }
     }
 }
 ```
 
Call then ```feather.start()``` and your application should render itself into ```<body>```. 

## Observable

### Primitives

The above example is quite rudimentary and if you wanted to change the variable ```who``` you would need to call ```render(...)``` again to see it.
This is a little bit cumbersome and expensive, since the widget would then re-render the entire template with any sub widgets referenced within. To 
avoid this you can annotate primitive members (currently only booleans, strings and numbers) with ```@Bind()``` like this:

```
@Construct({selector: 'body'})
export class MyApplication extends Widget {
    
    @Bind() who = 'world'
       
    init(element: HTMLElement) {
       this.render('default')
    }

    @Template('default')
    protected getBaseTemplate() {
        return (`
           Hello {{who}}!                                    
        `)
    }
}
```

Now whenever the value of ```who``` changes, the text node will update automatically.
 
... write the rest ...


### Arrays

### Objects

