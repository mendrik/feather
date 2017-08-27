module demo {

    import Widget    = feather.core.Widget
    import Construct = feather.annotations.Construct
    import Template  = feather.annotations.Template
    import Bind      = feather.observe.Bind
    import Write     = feather.observe.Write
    import Read      = feather.observe.Read

    export interface Person {
        name: string,
        siblings?: Person[],
        mother?: Person
    }

    export interface StoredPerson {
        name: string
    }

    @Construct({selector: 'Inheritance'})
    export class Inheritance extends Widget {

        @Bind({}) person: Person
        @Bind({localStorage: true}) people: Person[] = []
        @Bind({templateName: 'minimal'}) elements: ArrayElement[] = []

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
                <div id="inherit" test="{{inheritedString}}" length="{{filteredList:sizeOfArray}}" people={{people:sizeOfArray}}>
                    <span uncles={{person.mother.siblings:sizeOfArray}}>{{inheritedString}}</span>
                    <div id="person" siblingsLength={{person.siblings:sizeOfArray}} uncles={{person.mother.siblings:sizeOfArray}}>{{person.name}}</div>
                    <div id="mother">{{person.mother.name}}</div>
                    <div id="sibling-names">{{person.siblings:names}}</div>
                    <ul {{elements}}></ul>
                </div>
            `)
        }

        @Write('people') write = (person: Person): StoredPerson => ({name: person.name})
        @Read('people') read = (stored: StoredPerson): Person => ({name: stored.name})

        sizeOfArray = (arr: any[]) => `${arr.length}`
        names = (arr: Person[]) => `${arr.map(p => p.name).join(', ')}`
    }
}