---
date: 2017-10-29T21:07:13+01:00
title: A minimalistic framework
type: index
---

Feather is a small component framework written in [TypeScript](https://www.typescriptlang.org/).
You can use it to write embeddable widgets or single page applications. With less than 10kb in size 
it is suited for mobile apps and desktop alike. Regardless of its tiny footprint it has zero 
dependencies and provides routing, DOM events and REST integration out of the box.

The main goal is to provide a framework that has a flat learning curve and integrates well into any 
environment you throw it at. The resulting code is clean and lean and the generated HTML is just 
what you wrote without any trace of the framework which makes debugging a bliss. 

Unlike many other frameworks feather does not utilize a virtual dom. This has pros and cons that
you should consider before starting a project. Feather does not provide server-side rendering by 
itself, but this can be achieved with many other ready-made solutions. On the upside all DOM calls 
are synchronous and you can write UI tests against the real DOM without having to wait for the render 
loop to complete. Furthermore keeping track of what needs to update on a very granular level allows 
feather to minimize write access to the DOM and without the need to diff and patch two representations 
of the UI it also outperforms most frameworks in speed.

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
* With asynchronous decorators no need for _promises_
* Integrated media-query based views for responsive application design
* Support for modern browsers including IE9 (with polyfills)
* Component trees are initialized in off-screen document fragments for maximum performance.
* Access to up-tree properties without repetitive property clutter
* Generates clean HTML markup without any trace of the framework
* No wrappers required for your data holders

Intellij IDEA [plugin](http://dist.feather-ts.com/feather.jar) for syntax highlighting in templates 
and decorators.
  
> With this framework you will be able to write natural code without too many dogmatic aspects. 
> There is no hidden mess of global state objects, action constants, no hard to follow data messaging  
  
You can checkout a todomvc demo [here](http://todo.feather-ts.com).
  
