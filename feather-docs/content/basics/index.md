---
date: 2016-10-01T21:07:13+01:00
title: API Documentation
weight: 20
---

## Widgets

Your application will be a set of classes that must extend *feather.core.Widget*. The widget class itself 
inherits other (internal) classes in the following order, which represent different aspects of the framework.
Within the classes you can decorate methods to enhance the instances. Decorators are collected throughout
the class hierarchy, which allows you to subclass the widget class with own shared functionality.

```
MyWidget -> (?) -> Widget -> Observable -> RouteAware -> Subscribable -> EventAware -> MediaQueryAware -> Object
```

{{< note title="Notice" >}}
This might change if typescript or javascript gets a better way to create *mixins*. 
{{< /note >}}

### Widget

At its core a widget class is attached to a single DOM element. It will hold a reference to that element, 
which can be accessed in your class via ```this.element```. Furthermore it should have a method 
```myMarkup(templateName?: string): string```, which has to be called manually for the widget to render into 
its element. This is usually done in the overridden methhod ```init(el: HTMLElement)``` 

However, feather 
does not want to make assumption when to render the widget; it might be required to fetch data from 
the server or wait for other events to complete. To keep things simple the content of a widget's
@Template decorated method is added to the root element. If a widget is not added to an array templates
can return several root-nodes (this differs a bit from *React* for example).  
 
A widget usually comes with a ```@Construct({selector: string})``` class decorator, which defines which 
HTML elements the component will be attached to. Once the Widget has been created, you can override the 
```init(element: HTMLElement)``` method in your class and call this.render(templateName) there. 

{{< note title="Note" >}}
Widgets don't require a constructor and custom initialization should be done in the overwritten *init* 
method. An exception to this are array-widgets. Array widget are widgets that are pushed into an array
property of another widget. They differ in so far that they don't require a this.render() call nor must
they have a @Construct decorator.
{{< /note >}}

You can have different template returing methods in the same widget class and choose which one to run
when calling this.render().

Putting it all together, a very simple widget might look like this:
 
```typescript
 module demo {
 
     import Widget    = feather.core.Widget
     import Construct = feather.annotations.Construct
     import Template  = feather.annotations.Template
 
     @Construct({selector: 'body'})
     export class MyApplication extends Widget {
 
         who = 'world'   
 
         init(element: HTMLElement) {
             this.render()
         }
 
         @Template()
         protected getBaseTemplate() {
             return (`
                Hello ${this.who}!                                    
             `)
         }
     }
 }
 ```
 
Call now ```feather.start()``` and your application will render itself into ```<body>```. 

## Passing arguments to widgets

If you need to pass data from a widget to its children (usually referenced in its template), there are 
several possibilities, but all of them are done via constructor arguments.

### String attributes
 
The simplest one is using string attributes: ```<my-widget attr1="str1" attr2="str2">```. In your 
*MyWidget* class the @Construct decorator should have then an attribute array defined like so 
```@Construct({selector: 'my-widget', attributes: ['attr1', 'attr2']})```. Additionally provide a 
constructor with the following signature: ```constructor(attr1: string, attr2: string) {```. 
The order of the attribute array must match the constructor arguments.

### Complex types

If you need to pass something else than *strings* to the widget you can use single curly brackets to do this: ```<my-widget attr1={true} attr2={2+2}>``` 
and so on. If the text between the curly brackets matches a property name in the parent widget its value will be used instead.    

## Observable

Feather provides one-way data-binding, which means you can create *hooks* between the component's 
data and the DOM. Whenever the data changes your DOM will update accordingly. There are several hook types, 
which are explained below. Feather does not use a virtual dom, but it binds directly to native DOM 
modifiers which makes it even faster than any of the virtual dom based frameworks out there. 
Hooks are basically widget properties with a ```@Bind()``` decorator and depending on the property type a 
reference in the widget's template method, declared by double curly brackets. You can add hooks to:

### Primitives

The above example is quite rudimentary and if you wanted to change the variable ```who``` you would need 
to call ```render(...)``` again to see it. This is a little bit cumbersome and expensive, since the widget 
would then re-render the entire template with any children referenced within. To avoid this you can decorate 
primitive members (currently only booleans, strings, numbers but also arrays) with ```@Bind()``` like this:

<script async src="//jsfiddle.net/phbw6sdj/1/embed/js,result/"></script>

Now whenever the value of ```who``` changes, the text node will update automatically. You can bind properties 
in 4 different places within the template and in combation with the property type, only some of them make 
sense. Let's have a look:
 
 * ```<div class="right {{variable}} large">...</div>``` As a new class in the class attribute (only strings)
 * ```<div class="red" style="{{variable}}">...</div>``` Within an arbitrary attribute (only strings and booleans)
 * ```<div class="red" {{variable}}>...</div>``` As a property hook (booleans and arrays)
 * ```<div class="red">Some {{variable}} text!</div>``` Within a text node (only strings)

{{< note title="Note" >}}
Note that any binding can convert booleans, numbers or arrays into strings. This is done but declaring a *transformer* function in the widget 
class. You can then bind it like this: ```<div class="{{variable:formatAsString}}">...</div>```
{{< /note >}}

### Booleans

Booleans are bound almost the same way as primitives, but there are a few shortcuts that can be used:
 
  * ```<div class="right {{variable}} large">...</div>``` 
     Not supported, consider using a transformer function, declared on the same widget, which returns a string.  
  * ```<div class="red" style="{{variable}}">...</div>``` is variable is true the attribute will be set, otherwise removed
  * ```<div class="red" {{variable}}>...</div>``` Special shortcut where the attributes name is same as the variable. This is 
  useful for attributes like *checked* or *hidden*
  * ```<div class="red">Some {{variable}} text!</div>``` Not supported

 
### Arrays

Array bindings are maybe the most important ones, since they allow you map list structures to dom nodes. 
They can be also used to render different application pages or with transformer functions different 
mobile/desktop representations of your components.

Array hooks can be placed in only one manner:

  First declare ```@Bind({}) variable: MyWidget = []``` which contains objects that **must** extend ```Widget```.
  You can use any of the native array functions to modify the array, but you must not replace the array itself 
  as the bindings and hooks will be lost. Read more about bindings in the decorator section. Make sure not 
  to call this.render() in widgets that are inserted to a bound array. 

  * ```<div class="red" {{variable}}>...</div>``` 
  
{{< note title="Attention" >}}
Please don't use the same children in two different array bindings. Since children are also Widgets 
they must have one unique DOM element they attach to. Having the same child in different arrays, would 
simply move the element's DOM position instead of rendering  it twice as expected.
{{< /note >}}

#### Filtered Arrays

When binding arrays with a transformer function ```{{myarray:transformer}}``` the result differs depending 
on the transformer return type. If it returns a primitive type the binding behaves the same way it would 
when binding a primitive type. However, if the transformer returns a function, this will be used to filter 
the array and remove invisible elements from the DOM. The returned function signature must be: 

```typescript
   transformer() {
      return (el: MyChildWidget) => boolean
   }
```

Check the [listFilter](https://github.com/mendrik/feather-todo/blob/master/ts/todo-list.ts#L79) in our sample application and
its [definition](https://github.com/mendrik/feather-todo/blob/master/ts/todo-list.ts#L40)

### Objects

There are no object bindings in feather. If you need subcomponents you should consider creating a 
new ```Widget``` and add it via template strings or array properties to you parent component.

## Imports

Feather doesn't use any module loaders, so the imports are written like this:

```typescript
module mypackage {

    import Widget       = feather.core.Widget
    import Construct    = feather.annotations.Construct

    @Construct({selector: 'body.my-app'})
    export class MyApplication extends Widget {
       ...
    }
```

Make sure the files are listed in correct order in your *tsconfig.json*. Since the goal is to keep everything 
minimal and blazing fast it is advised to compress all your app code into a single file. 
