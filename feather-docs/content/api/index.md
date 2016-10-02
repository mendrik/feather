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
called manually for the widget to render into it's element. Feather doesn't want to make assumption when to render the 
widget; tt might be required fetch data from a server first or wait for other events before the rendering occurs. 
 
A widget usually comes with a ```@Construct({selector: string})``` annotation, which defines which HTML elements the 
component will be attached to. Once the Widget cas been created, you can override the ```init(element: HTMLElement)``` in your 
class and call this.render(templateName) there. The templateName is definied via ```@Template()```, which should 
decorate a method which returns a string the template should be rendere with.

Putting it all together a very simple widget might look like this:
 
```
 /// <reference path="../typings/feather.d.ts" />
 
 module demo {
 
     import Widget    = feather.core.Widget
     import Construct = feather.annotations.Construct
     import Template  = feather.annotations.Template
 
     @Construct({selector: 'body'})
     export class MyApplication extends Widget {
 
         init(element: HTMLElement) {
             this.render('default')
         }
 
         @Template('default')
         protected getBaseTemplate() {
             return (`
                Hello world!                                    
             `)
         }
     }
 }
 ```
 
Call then ```feather.start()``` and your application should render itself into ```<body>```.

