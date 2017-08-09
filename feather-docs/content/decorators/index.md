---
date: 2017-08-06T21:07:13+01:00
title: Decorators
weight: 30
---

Feather provides a bunch of decorators to add functionality to your components. However, most of 
them decorate the instances and not the classes, which would be typescript's default behaviour. 
This is achieved internally with a few tricks, but you should remember this difference when writing 
components. For example you cannot use decorator arguments with references to *this*. Most of the 
decorators that need access to instance variables provide a similar pattern that is used in template
methods: tokens in double curly brackets within a string.

## @Construct

```
  @Construct({
    selector: string
    attributes?: string[]
    singleton?: boolean
  })
```

The only *class* decorator, which defines which DOM element the widget should be instantiated with.

### selector

The selector that creates a new component. Can be used either on document level or inside templates.
Only widgets that are pushed into an array of another widget don't need this decorator.

### attributes

A list of attributes that should be collected and passed on to the widget's constructor. Make sure the
order matches the constructor's arguments. 

### singleton

A boolean marker that can be used with ```this.triggerSingleton()```. See more in @Subscribe()

## @Bind

Allows to bind component data to DOM hooks, which will update your UI whenever the underlying data
changes.

```
  @Bind({
      templateName?: string   
      changeOn?: string[] 
      localStorage?: boolean
      html?: boolean
  })
```

### templateName 
  This is used with array bindings and specifies which template method should 
  be used in the child widget class to render its children. If no name is used it defaults to
  the method that is decorated with no-arg @Template()
  
  {{< note title="Note" >}}
  Note that child widget should not
  call this.render() in the init method, since the framework will take care of this. 
  {{< /note >}}
  
  Here an example:

```
  class Parent extends Widget {
    @Bind({}) myArray: Child[] = []
    @Bind({templateName: 'alternative'}) myOtherArray: Child[] = []
    
    init() {
      this.render()
    }
    
    @Template()
    markup() {
      <uL {{myArray}}></ul>
      <uL {{myOtherArray}}></ul>
    }
  }
  
  class Child extends Widget {
  
    @Template()
    markupOne() {
      return <li>A</li>
    }    
  
    @Template('alternative')
    markupTwo() {
      return <li>B</li>
    }    
  
  }
```

### changeOn

This is also used exclusively with array bindings and will trigger all template hooks to be re-evaluated. 
Especially useful when you have transformers that reduce the array to a string or filter the array. 

```
  class Parent extends Widget {
    @Bind({changeOn: ['state']}) myArray: Child[] = []
    @Bind() state = true
    
    init() {
      this.render()
    }
    
    @Template()
    markup() {
      <ul {{myArray:filter}}></ul>
    }
    
    filter() {
      return (el: Child) => this.state
    }
  } 
```

Now if you change *state* the ```<ul>``` tag will show or hide its child widgets.

### localStorage

This boolean will initialize a binding value from *localstorage*. With array bindings, however, you must define 
```@Read(arrayProperty: string)``` and ```@Write(arrayProperty: string)``` serializers for its children. 
This is best explained in the following [source file](https://github.com/mendrik/feather-todo/blob/master/ts/todo-list.ts). 
Primitives are stored without any serializers. The local storage name is calculated from the widgets
path (resolved through parentWidgets). Each path segment is taken from a property called id, name, title or
a function named like this. If no are present the widgets class name is taken.

### html

With string bindings you might sometimes want to inject unescaped html fragments into the dom tree. The only
restriction is that you cannot inject it at a template's root node. This is experimental, so use it with care.

## @On

With this decorator you can add event listeners to the widget's element. The evaluation is done via delegation.
And event bubbling stops the widget's element. If you need to bubble events further up, you must set *bubble* 
to true.

```
  @On({
    event: string 
    scope?: Scope
    selector?: string
    preventDefault?: boolean
    bubble?: boolean
  })
```

### event

The DOM event to listen to: 'click', 'mouseover', ...

### scope

Scope can be ```Scope.Direct``` or ```Scope.Delegate``` from feather.event package. If set to Scope.Direct, the event 
listener is attached directly to the first element that matches the selector property. 

### selector

The selector that must be matched for the delegate event to trigger. Usually a node present in the template.

### preventDefault

Small helper if you want to avoid calling ```ev.preventDefault()``` yourself. Same as: 
```
  @On({event: 'click'})
  click(ev: MouseEvent) {
    ev.preventDefault()
    ...
  }
```

### bubble

If set to true, it Will bubble the dom event beyond the widget's root element. Feather cancels event propagation
by default so it is possible to have nested Widgets of the same class and scope their events accordingly.

## @Media

```
  @Media('(min-width: 600px)')
```

Triggers the method if the specified media query matches. This can be used to run different logic for different
viewport sizes. You could for example set a viewport state and filter an array binding with different components.
See @Bind/changeOn for more info. The method is called initially if matched, but also when viewport size changes.
This way you don't need to utilize resize or orientationchange events at all.

## @Route

Triggers when the route matches the current location. Feather supports hash based urls, but also HTML5's 
histort API. IF you want to enable hash based routing add an attribute ```routing="hash"``` anywhere in your
document. For example <html routing="hash">

```
  @Route('/:path')
```

Route parsing is very basic and supports only :path and *path tokens. The called method is passed an object
where the properties correspond to the named tokens:

```
  interface MyRoute {
    path: string
    id: string
  }  

  @Route('/:path/:id')
  locationPath(route: MyRoute) {
    ...
  }
```

When using historyAPI make sure all your document urls load the original document on the server-side.

## @Subscribe

Subscribe to component events. Events can be broadcasted either up or down the widget hiearchy. A widget
object has always an array of childWidget and an optional parentWidget. With ```this.triggerUp('my-event', data)``` 
you can notify decorated methods in parent widgets and with ```this.triggeDown('my-event', data)``` accordingly
all child widgets. This also works with array bound child widgets.

A special case are singletons that can be notified via ```this.triggerSingleton('my-event', data)```. For this
to work you must set singleton property to true in @Construct(). Make sure you create only one instance of 
this widget, otherwise you might encounter unpredicted side effects. 

```
  @Subscribe('my-event')
```

## @Template

```
  @Template(name?: string, warmUp?: boolean)
```

Decorate methods that return a simple html string to render the widget. You can have multiple templates 
per single widget if you need to display them in different ways. If the name parameter is missing it 
is set to 'default'. Then you can use this.render() without any arguments, otherwise call this.render(name)
with name being set to the match the @Template(name) decorator.


## @Rest

```
  @Rest({
    url:              string
    method?:          MethodValue
    timeout?:         number
    async?:           boolean
    responseFilter?:  (data: string) => any
    requestFilter?:   (data: string) => any
    progress?:        (ev: ProgressEvent) => any
    withCredentials?: boolean
    body?:            string
    headers?:         TypedMap<string|StringFactory>
  })
```

If your application consumes REST apis this will help you to receive data to your components. Most of the 
parameters above are preset already, but let's have a look at a simple example:

```
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
typesript compiler the project argument is optional, because it works so, that ```this.fetchProject()```
will make the http request and call the method with the received data. To catch request failures subscribe
to xhr fail events:

```
  @Subscribe('xhr-failure-401')
  unauthorized() {
    this.route('/login')
  }
```

Change the status code accordingly. 

### url

The url to make the request to. As you can see the url can contain properties from the widget to allow 
dynamic requests.

### method

From feather.xhr.Method
```
  export const Method = {
      GET:    'GET'    as MethodValue,
      POST:   'POST'   as MethodValue,
      DELETE: 'DELETE' as MethodValue,
      PUT:    'PUT'    as MethodValue
  }
```

### timeout

Override the default xhr request timeouts.

### progress

The default progress listener can be listened to via 
```
@Subscribe('xhr-progress')
onProgress(ev: ProgressEvent) {
  ...
}
```

### body

When using Method.POST you might want to post a request load to the server. For that declare a widget
property which will be automatically serialized to JSON and posted.

```
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

If you need to add custom headers to your requests you can use this.

```
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

{{< note title="Note" >}}
More information can be found directly from the source code of feather-ts. Check it out on github. 
{{< /note >}}
