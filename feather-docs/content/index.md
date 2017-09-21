---
date: 2017-10-29T21:07:13+01:00
title: A minimalistic framework
type: index
---
##### Because digging deeper doesn't get you out of a hole. 

_Feather_ is a small but powerful _ui_ framework written in [TypeScript](https://www.typescriptlang.org/).
You can use it to write embeddable widgets or single page applications. With less than 10kb in size 
it is suited for mobile apps and desktop alike. Regardless of its tiny footprint it has zero 
dependencies and provides routing, component messaging, _dom_ events and _rest_ integration out of the box.

The main goal is to provide a framework that has a flat learning curve and integrates well into any 
environment you throw it in. The resulting code is clean and lean and the generated HTML is just 
what you wrote without any trace of the framework which makes debugging a bliss. 

Unlike many other frameworks _feather_ does not utilize a virtual dom. This has pros and cons that
you should consider before starting a project. It does not provide server-side rendering by 
itself, but this can be achieved with many other ready-made solutions. On the upside all _dom_ calls 
are synchronous and you can write _ui_ tests against the real _dom_ without having to wait for the render 
loop to complete. Furthermore keeping track of what needs to update on a very granular level allows 
it to minimize write access to the _dom_ and without the need to diff and patch two representations 
of the _ui_ it also outperforms most frameworks in [speed](http://www.feather-ts.com/todomvc/todomvc-benchmark/index.html).

### The framework offers the following features:

* Each component is holding logic, view and model in a single file
* Components automatically build a hierarchical tree
* Message hub between components and singletons
* Easy REST consumption
* Routing via hash or history API 
* Pure HTML templates without logic and a very simple binding syntax
* Event delegation out of the box
* Written in TypeScript
* No module loaders needed, just a single throw-in file.
* With asynchronous decorators no need for promises
* Integrated media-query based views for responsive application design
* Support for modern browsers including IE9 (with polyfills)
* Component trees are initialized in off-screen document fragments for maximum performance.
* Access to up-tree properties from child components
* Generates clean HTML markup without any trace of the framework
* No wrappers required for your data holders
* No pass-down property clutter
* No actions, action creators, reducers, sinks, directives, intents or other vocabulary needed.
* First meaningful rendering in midsized apps in less than 150ms.

Feather is a back to the basics tool and tries to make coding SPAs fun again. If you come back 
to your code months from now, you won't have to wonder what you did to make the framework work
or how the data flow was going. The code is flat and reduced to your own business logic without
any dogmatic constructs you need to follow. 

## Intellij IDEA

Feather comes with an own [IDE plugin](http://dist.feather-ts.com/feather.jar) to help you with syntax 
highlighting and mistyped references. Grab it from the link or the official plugin repository.
  
## Examples  
    
* <div>You can check out the todomvc demo from [here](http://todo.feather-ts.com).</div>
* <div>Some UI components written with feather-ts are located [here](https://github.com/mendrik/feather-components).</div>
  
