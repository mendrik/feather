module demo {

    import Widget    = feather.core.Widget
    import Construct = feather.annotations.Construct
    import Template  = feather.annotations.Template
    import Bind      = feather.observe.Bind

    export interface Person {
        name: string,
        siblings?: Person[],
        mother?: Person
    }

    @Construct({selector: 'Inheritence'})
    export class Inheritence extends Widget {

        @Bind({}) person: Person

        constructor() {
            super();
            window['inh'] = this
        }

        init() {
            const mother = {
                name: 'Michaela',
                siblings: [{name: 'Piotr'}]
            }
            this.person = {
                name: 'Andreas',
                siblings: [{name: 'Peter', mother: mother}, {name: 'Ella', mother: mother}],
                mother: mother
            }
            this.render('default')
        }

        @Template()
        protected getBaseTemplate() {
            return (`
                <div id="inherit" test="{{inheritedString}}" length="{{filteredList:sizeOfArray}}">
                    <span>{{inheritedString}}</span>
                    <div id="person" siblingsLength={{person.siblings:sizeOfArray}} uncles={{person.mother.siblings:sizeOfArray}}>{{person.name}}</div>
                    <div id="mother">{{person.mother.name}}</div>
                </div>
            `)
        }

        sizeOfArray = (arr: any[]) => `${arr.length}`
    }
}
