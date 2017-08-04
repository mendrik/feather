# Feather TS

<img src="http://cd.feather-ts.com/mendrik/feather/badge/?branch=master" height="20">&nbsp;<img src="http://dist.feather-ts.com/size.svg" height="20">&nbsp;<img src="http://www.feather-ts.com/images/licence.svg" height="20">

---
**THIS PROJECT IS WORK IN PROGRESS, DO NOT USE YET**

A feather-light :D framework written in typescript with support for

* One-directional binding
* REST consumption
* Routing with HTML5 history API
* Component messaging
* DOM event handling
* Templates are HTML without logic
* Runs on modern browsers and IE9+
* Integrated media query evaluation in javascript
* Clean and simple code
* No promise clutter
* Less than 10kb gzipped

---

# Installation
```
npm install feather-ts --save
```
---

# Requirements

- nodejs
- typescript
- set experimentalDecorators=true in your tsconfig.json
- older browsers might need polyfills for Classlist, WeakMap (IE9+ with polyfills should work)

# Usage

Check out the official [website](http://www.feather-ts.com)

# TodoMVC

An example implementation can be be found [here](http://todo.feather-ts.com/). Source maps are embedded.

# Work to be done

- How to handle multiple REST request callbacks: @Rest({urls: [url1, url2, url3], method, headers})

