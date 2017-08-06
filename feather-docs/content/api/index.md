---
date: 2016-10-01T21:07:13+01:00
title: API Documentation
weight: 20
---

## Widgets

Your application will be a collection of classes that all extend feather's *Widget* class. The widget class itself inherits
other classes in the following order:

```
MyWidget -> Widget -> Observable -> RouteAware -> Subscribable -> EventAware -> MediaQueryAware -> Object
```

This might change if typescript or javascript gets a better way to create *mixins*. 

### Widget

At its core a widget class is attached to a single DOM element. It holds a reference to that element, which can be accessed
in your class via ```this.element```. Furthermore it exposes a method ```render(templateName: string)```, which has to be 
called manually for the widget to render into its element. Feather doesn't want to make assumption when to render the 
widget; it might be required to fetch data from a server or wait for other events first. 
 
A widget usually comes with a ```@Construct({selector: string})``` class decorator, which defines which HTML elements the 
component will be attached to. Once the Widget cas been created, you can override the ```init(element: HTMLElement)``` method 
in your class and call this.render(templateName) there. The templateName is defined via ```@Template()```, which should 
decorate a method which returns a string it should render. Note the widgets don't require a constructor, and most of the 
custom initialization should be done in the overwritten ```init``` method. An exception to this are array-widgets, but more 
on this later.

You can also have different templates in the same widget class and choose which way to render the widget's data.

Putting it all together, a very simple widget might look like this:
 
```
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
                Hello ${this.who}!                                    
             `)
         }
     }
 }
 ```
 
Call then ```feather.start()``` and your application should render itself into ```<body>```. 

## Observable

Feather provides one-way data-binding, which means you can create *hooks* between the components data holders and the DOM. Whenever the data changes,
your DOM will update accordingly. There are several hook types, which are explained below. Feather doesn't use a virtual dom, but it binds directly to 
native DOM modifiers which makes it even faster than any of the virtual dom based frameworks out there.

### Primitives

The above example is quite rudimentary and if you wanted to change the variable ```who``` you would need to call ```render(...)``` again to see it.
This is a little bit cumbersome and expensive, since the widget would then re-render the entire template with any sub widgets referenced within. To 
avoid this you can decorate primitive members (currently only booleans, strings and numbers) with ```@Bind()``` like this (note the use of double-curlies):

<script async src="//jsfiddle.net/phbw6sdj/1/embed/js,result/"></script>

Now whenever the value of ```who``` changes, the text node will update automatically. You can bind variables in 4 different places within 
a dom tree and in combation with the variable type, only some of them make sense. The hooks can be inserted in these ways:
 
 * ```<div class="right {{variable}} large">...</div>``` As a new class in the class attribute (only strings)
 * ```<div class="red" style="{{variable}}">...</div>``` Within an arbitrary attribute (only strings and booleans)
 * ```<div class="red" {{variable}}>...</div>``` As a property hook (booleans and arrays)
 * ```<div class="red">Some {{variable}} text!</div>``` Within a text node (only strings)
 
Note that any binding can convert booleans, numbers or arrays into strings. This is done but declaring a *transformer* function in the widget 
class. you can then bind it like this: ```<div class="{{variable:formatAsString}}">...</div>```

### Booleans

Booleans are bound almost the same way as primitives, but there are a few shortcuts that can be used:
 
  * ```<div class="right {{variable}} large">...</div>``` 
     Not supported, consider using a transformer function, declared on the same widget, which returns a string.  
  * ```<div class="red" style="{{variable}}">...</div>``` is variable is true the attribute will be set, otherwise removed
  * ```<div class="red" {{variable}}>...</div>``` Special shortcut where the attributes name is same as the variable. This is 
  useful for attributes like *checked* or *hidden*
  * ```<div class="red">Some {{variable}} text!</div>``` Not supported

 
### Arrays

Array bindings are the maybe the most important ones, since they allow you map list structures to dom nodes. They can be also
used to render different application pages or with filters mobile/desktop representations of components (if css is not sufficient).

Array hooks can be placed in only one manner:

  First declare ```@Bind({}) variable: MyWidget = []``` which contains objects that **must** extend ```Widget```. You can use
  any of the native array functions to modify the array, but you must not replace the array itself as the bindings and hooks 
  will be lost. Read more about bindings in the decorator section. 

  * ```<div class="red" {{variable}}>...</div>```  


### Objects

There are no object bindings in feather. If you need subcomponents you should consider creating a new ```Widget``` and add it via template 
strings to you parent component.


