---
date: 2017-09-26T21:07:13+01:00
title: Installation
---

Since feather is a single file framework all you need is to install it as dependency via NPM. The package comes with two
files: feather.min.js and feather.d.ts for the typescript declarations.

```
npm install feather-ts --save
```

The next thing you probably want to do is to create a ```tsconfig.json``` file. Make sure you enable experimental decorators
and you can disable emitting helpers, because feather already embeds them from [tslib](https://github.com/Microsoft/tslib). 
An example config could look something like this:

```json
{
    "compileOnSave": true,
    "compilerOptions": {
        "sourceMap": true,
        "sourceRoot": "./",
        "rootDir": "./",
        "noEmitHelpers": true,
        "removeComments": false,
        "target": "es5",
        "experimentalDecorators": true,
        "out": "yourpath.js",
        "lib": ["es2015", "dom"],
        "types": ["feather-ts"],
        "typeRoots": ["node_modules"]
    },
    "files": [
        ...
    ]
}
```

Next include the output together with feather.min.js from node_modules in your HTML page.
After the DOM and the scripts have been loaded make the following call to bootstrap widgets and routes. 

```typescript
feather.start();
```

## A widget's anatomy

To get an impression of the code style you will be dealing with here is an example. As you can see the code is
very compact and flat.

```typescript
module todomvc.feather {

    /* imports of referenced components */
    import Widget = feather.core.Widget 
    import Construct = feather.annotations.Construct
    import Template = feather.annotations.Template
    import Bind = feather.observe.Bind
    import Fetch = feather.xhr.Rest
    import Subscribe = feather.hub.Subscribe
    import Route = feather.routing.Route
    import On = feather.event.On
    
    interface RouteParts {
        path: string
    }

    /* the selector to bind this widget to */
    @Construct({selector: '.todoapp'}) 
    /* all widgets must extend Widget */
    class TodoList extends Widget {    

        /* prefix members that auto update DOM with @Bind(), 
         * supported are booleans, strings and numbers */
        @Bind() state = ListState.ALL  

        /* arrays are a special case, more about the params later */
        @Bind({templateName: 'default', changeOn: ['state']}) 
        todos: Todo[] = []
        
        /* no constructor is required */
        /* whenever a widget is fully initialized it calls init() */
        init(element: HTMLElement) {   
            this.getData()
        }
        
        /* fetch data from a REST api and render the widget */
        @Fetch({url: '/api/todos'})           
        getData(data?: Todo[]) {
            this.todos.push.apply(this.todos, data)
            /* if you're not loading data you can render() already in init() */
            this.render('default')     
        }

        /* listen to messages from parent or child widgets via @Subscribe */
        @Subscribe('create-todo')      
        newTodo(todo: Todo) {
            this.todos.push(todo)
        }

        /* listen to route changes with @Route */
        @Route('/:path')               
        locationPath(params: RouteParts) {
            if (params.path === 'active') {
                ...
            }
        }

        /* attach DOM events via @On */
        @On({event: 'click', selector: '.clear-completed', preventDefault: true}) 
        clearCompleted() {
            ...
        }

        /* widgets can be rendered with different templates */
        @Template('default') 
        toHtml() { /* use ES6 template strings to define HTML snippets */
            return (`
              ...
              <ul class="todo-list" {{todos:listFilter}}></ul>
              <button class="clear-completed" hidden="{{todos:noCompleted}}">
                    Clear completed
              </button>
              ...
            `)
        }
    }
}
```

See the full todo app in action [here](http://todo.feather-ts.com/). Take a peek at the typescript source maps, too.

> The bindings in the HTML code are very simple. The only extra syntax on top of regular HTML is ```{{variable:methodA:methodB}}```. 
Methods are optional however they can convert values to other types, i.e. booleans to "yes" / "no" strings or filter arrays before rendering.
In some cases the variable can also reference deep properties with object dot notation. 
