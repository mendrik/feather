---
date: 2016-02-01T21:07:13+01:00
title: Documentation
---

Feather provides a few decorators to add functionality to your components. However, most of 
them decorate the instances and not the classes, which is typescript's default behaviour. 
This is achieved internally with a few tricks, but you should remember that difference when writing 
components. For example you cannot use *this* in the decorator's arguments. Most of the 
decorators that need access to instance properties provide a similar pattern that is used in template
methods: tokens in double braces within a string.

## @Construct

```typescript
  @Construct({
    selector: string
    attributes?: string[]
    singleton?: boolean
  })
```

The only *class* decorator which defines which DOM element the widget should be instantiated with.

### selector

The dom selector that creates a new component; can be used either on the document level or inside a template.
Only widgets that are pushed into an array of another widget don't need this decorator.

### attributes

A list of attributes that should be collected and passed on to the widget's constructor. Make sure the
order matches the constructor's arguments. 

### singleton

A boolean marker that can be used with ```this.triggerSingleton()```. See more under [@Subscribe](/documentation/#subscribe). 
Singletons are additionally in so far special that transformer methods can reference those. This is useful
if you want to define a "global" localization method in a high-up singleton component, that serves translated keys
to other components. 

## @Bind

Allows to bind component properties to DOM which will update your UI whenever the bound property 
changes. When widgets are stored in a parent array the array evaluation is buffered. Even though
you won't have to care much about this, note that this is the only operation in feather-ts that runs 
asynchronously.
What this means in practice is that when you change properties of array children in a loop, the 
array bindings and their transformers will run only once instead of every time a change on each child 
occurs. This might be useful to know when writing tests so make sure the evaluation waits for the buffer,
which is currently set to 5ms.

```typescript
  @Bind({
      templateName?: string,   
      localStorage?: boolean,
      html?: boolean,
      bequeath?: boolean,
      affectsArrays?: string
  })
```

### templateName 
This is used with array bindings and specifies which template method should be used to render the children. 
If no name is used it defaults to the method that is decorated with no argument inside of @Template()

> Note that child widgets in an array should not call ```this.render()``` in the init method, since the 
> framework will take care of this. However, you can still use the init method for other bootstrapping. 
  
  Here an example:

```typescript
  class Parent extends Widget {
    @Bind({}) myArray: Child[] = []
    @Bind({templateName: 'alternative'}) myOtherArray: Child[] = []
    
    init() {
      this.render()
    }
    
    @Template()
    markup() {
      return `<uL {{myArray}}></ul>
              <uL {{myOtherArray}}></ul>`
    }
  }
  
  class Child extends Widget {
  
    @Template()
    markupOne() {
      return `<li>A</li>`
    }    
  
    @Template('alternative')
    markupTwo() {
      return `<li>B</li>`
    }    
  
  }
```

Now if you change *state* the ```<ul>``` tag will show or hide its children.

### localStorage

This boolean will initialize a binding from *localStorage*. With array bindings, however, you must define 
```@Read(arrayProperty: string)``` and ```@Write(arrayProperty: string)``` serializers for its children. 
This is best explained in the following [source file](https://github.com/mendrik/feather-todo/blob/master/ts/todo-list.ts). 
Primitives are stored without any serializers. The local storage name is calculated from the widgets
path (resolved through parent widgets). Each path segment is taken from a property called id, name, title or
a function named like this. If none are present, the widget's class name is taken. Make sure the path segments 
are unique for each widget instance. 

Local storage serialization is executed after a timeout to not block the rendering queue. Currently the delay is
set to 50ms.

### bequeath

This property means that it can be also bound in child widget templates. This is an easy
way to render parent properties in child components without having to rely on @Subscribe to pass around data
in your application.  

### affectsArrays

If you want array bindings to update whenever a property in their children changes, you must set this
to an array containing the names of the array properties from this or any parent widgets.

### html

When set to true the property will be injected as unescaped html. The injected html doesn't have to have a single
root node. Feather will keep track of cleaning up multiple root nodes automatically.

## @On

With this decorator you can add event listeners to the root element of a widget. The event handling is done through 
delegation. Event bubbling stops the root element. If you need to bubble events further up you must set *bubble* 
to true.

```typescript
  @On({
    event: string, 
    scope?: Scope,
    selector?: string,
    preventDefault?: boolean,
    bubble?: boolean
  })
```

### event

The DOM event to listen to: 'click', 'mouseover', ...

### scope

Scope can be ```feather.even.Scope.Direct``` or ```feather.even.Scope.Delegate```. If set to Scope.Direct the event 
listener is attached directly to the first element that matches the selector. 

### selector

The selector that must be matched for the delegated event to trigger: a node present in the template method.

### preventDefault

Small helper if you want to avoid calling ```ev.preventDefault()``` yourself. Same as: 
```typescript
  @On({event: 'click'})
  click(ev: MouseEvent) {
    ev.preventDefault()
    ...
  }
```

### bubble

If set to true it will bubble this dom event beyond the widget's root element. Feather stops event propagation
by default at the root, so it is possible to have nested Widgets of the same class and scope their events accordingly. 

> You can also use own event extensions to define gestures. This is quite advanced but an example is 
> [available here](https://github.com/mendrik/feather-components/blob/master/src/common/events.ts)  

## @Media

```typescript
  @Media('(min-width: 600px)')
```

Triggers the method if the specified media query matches. This can be used to run different logic for different
viewport sizes. You could for example set a viewport state and filter an array binding with different components.
See @Bind/affectsArray for more info. The method is called initially if matched but also when the viewport size changes.
This way you don't need to utilize resize or orientationchange events at all.

## @Route

Triggers when the route matches the current location. Feather supports hash based urls but also HTML5's 
history API. If you want to enable hash based routing add an attribute ```routing="hash"``` anywhere in your
document. For example ```<html routing="hash">```

```typescript
  @Route('/:path')
```

Route parsing is very basic and supports only :path and *path tokens. The called method is passed an object
where the properties correspond to the named tokens in the route:

```typescript
  interface MyRoute {
    path: string
    id: string
  }  

  @Route('/:path/:id')
  locationPath(route: MyRoute) {
    ...
  }
```

When using historyAPI make sure all your document urls load the original document on the server-side. Unlike
with hash routing links must be intercepted and manually routed. One can do this easily with a small widget:

```typescript
// modify the selector to be more strict if needed
@Contruct({selector: 'a:not([href^="http://"])'}) 
class RoutingLink extends Widget {

  @On({event: 'click', preventDefault: true})
  click(ev: MouseEvent, a: HTMLAnchorElement) {
     this.route(a.getAttribute('href'))        
  }
  
}

```

## @Subscribe

Subscribe to component events. Events can be broadcasted either up or down the widget's hierarchy. A widget
object has always an array ```childWidgets``` and an optional ```parentWidget``` reference. 
With ```this.triggerUp('my-event', data)``` you can notify decorated methods in parent widgets and with 
```this.triggeDown('my-event', data)``` accordingly all children. This also propagates into arrays.

A special case are singletons that can be notified via ```this.triggerSingleton('my-event', data)```. For this
to work you must set the ```singleton``` property to true in @Construct(). Make sure you create only one 
instance of this widget otherwise you might encounter unpredicted side effects. 

```typescript
  @Subscribe('my-event')
```

## @Template

```typescript
  @Template(name?: string, warmUp?: boolean)
```

Decorate methods that return html as string to render the widget. You can have multiple templates 
per single widget if you need to display it in different ways. If the name parameter is missing it 
is set to 'default'. Then you can use this.render() without any arguments otherwise call this.render(name)
with the name being set to match the @Template(name) decorator. 

Note that template methods must be real methods and not arrow function.


## @Rest

```typescript
  @Rest({
    url:              string,
    method?:          MethodValue,
    timeout?:         number,
    async?:           boolean,
    responseFilter?:  (data: string) => any,
    requestFilter?:   (data: string) => any,
    progress?:        (ev: ProgressEvent) => any,
    withCredentials?: boolean,
    body?:            string,
    headers?:         TypedMap<string|StringFactory>
  })
```

If your application consumes REST APIs this will help you to receive data to your components. Most of the 
parameters above are preset for json APIs. Let's have a look at a simple example:

```typescript
  class Parent extends Widget {
    
    projectId : number
    
    init() {
      this.projectId = 10
      this.fetchProject()
    }
    
    @Rest({url: '/projects/{{projectId}}', headers: quill.headers})
    fetchProject(project?: Project) {
    }
  } 
```

The default *Method* is *GET* and the accept-headers are set to json/application. To avoid errors in the
typescript compiler the project argument is optional, because it works so that ```this.fetchProject()```
will make the http request and call the method with the received data. To catch request failures subscribe
to xhr failure events:

```typescript
  @Subscribe('xhr-failure-401')
  unauthorized() {
    this.route('/login')
  }
```

Change the status code accordingly. Apart from non 2** and 3** status errors, feather fires also 
xhr-failure-cancel, xhr-failure-abort, xhr-failure-timeout if those occur. 

### url

The url to make the request to. As one can see the url can contain properties from the widget to allow 
dynamic requests.

### method

From feather.xhr.Method
```typescript
  export const Method = {
      GET:    'GET'    as MethodValue,
      POST:   'POST'   as MethodValue,
      DELETE: 'DELETE' as MethodValue,
      PUT:    'PUT'    as MethodValue
  }
```

### timeout

Override the default xhr request timeout value in milliseconds.

### progress

A progress listener can be handled via
 
```typescript
@Subscribe('xhr-progress')
onProgress(ev: ProgressEvent) {
  ...
}
```

### body

When using Method.POST one might want to post a request load to the server: declare a widget
property which will be automatically serialized to JSON and posted. You can also use parts 
of the referenced object with dot notation ie: 'data.x'

```typescript
  class Parent extends Widget {
    
    projectId : 5
    data: {
      name: 'data'
    }
    
    init() {
      this.postProject()
    }
    
    @Rest({url: '/projects/{{projectId}}', method: Method.POST, body: 'data'})
    postProject(project?: Project) {
    }
  } 
```

### headers

If one needs to add custom headers to the request one can use it like so:

```typescript
  export const headers: TypedMap<string|StringFactory> = {
      'X-Api-Key': 'AbCdEfGhIjK1',
      'Content-Type': 'application/json',
      'Accept-Language': 'en_IE.UTF-8',
      [AUTH_HEADER]: localStorage.getItem(AUTH_HEADER)
  }

  ...
  @Rest({url: '/translations', headers: mypackage.headers})
  fetchTranslations(translations?: Messages) {
      ...
  }
```

> More information can be found directly from the source code of feather-ts. Check it out on github either from 
> the [framework](https://github.com/mendrik/feather) or the [UI components](https://github.com/mendrik/feather-components). 
