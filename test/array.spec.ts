import {featherStart} from './test-head'
import {expect} from 'chai'
import {assert} from 'chai'
import ArrayListener = feather.arrays.ArrayListener

function Plan(count, done) {
    this.done = done
    this.count = count
}

Plan.prototype.ok = function(expression) {
    assert(expression)

    if (this.count === 0) {
        assert(false, 'Too many assertions called')
    } else {
        this.count--
    }

    if (this.count === 0) {
        this.done()
    }
}

describe('Arrays', () => {

    let window, feather, document
    before(done => featherStart(w => (
        window = w,
        feather = w.feather,
        document = w.document
    ) && done()))

    describe('Arrays.from', () => {

        it('should convert DomList', () => {
            const spans = document.querySelectorAll('span'),
                asArray = feather.arrays.from(spans)
            expect(asArray.length).to.be.equal(spans.length)
            expect(Array.isArray(asArray)).to.be.true
        })

        it('should copy array', () => {
            const arr = feather.arrays.range(5, 10),
                copy = feather.arrays.from(arr)
            copy[0] = 1
            expect(Array.isArray(copy)).to.be.true
            expect(copy.length).to.be.equal(arr.length)
            expect(arr[0]).to.be.equal(5)
        })
    })

    describe('Arrays.range', () => {
        it('should create range', () => {
            const r1 = feather.arrays.range(5, 10)
            expect(r1.length).to.be.equal(6)
            expect(r1[0]).to.be.equal(5)
            expect(r1[r1.length - 1]).to.be.equal(10)
        })
    })

    describe('Arrays.removeFromArray', () => {
        it('should remove elements from array', () => {
            const range = feather.arrays.range
            const remove = feather.arrays.removeFromArray

            const a = [1, 2, 3, 4],
                b = [1, 2, 3, 4],
                c = [1, 2, 3, 4],
                d = [1, 2, 3, 4],
                e = [1, 2, 3, 4]
            remove(a, [4])
            remove(b, [1])
            remove(c, [1, 4])
            remove(d, [1, 2, 3, 4])
            remove(e, [])
            expect(a).to.be.deep.equal([1, 2, 3])
            expect(b).to.be.deep.equal([2, 3, 4])
            expect(c).to.be.deep.equal([2, 3])
            expect(d).to.be.deep.equal([])
            expect(e).to.be.deep.equal([1, 2, 3, 4])

            const r1 = range(1, 10),
                  r2 = range(3, 7)
            remove(r1, r2)
            expect(r1).to.be.deep.equal([1, 2, 8, 9, 10])

            const r3 = range(1, 10),
                  r4 = [1, 3, 5, 7, 9]
            remove(r3, r4)
            expect(r3).to.be.deep.equal([2, 4, 6, 8, 10])

            const r5 = range(1, 10),
                  r6 = range(1, 5)
            remove(r5, r6)
            expect(r5).to.be.deep.equal([6, 7, 8, 9, 10])

            const r7 = range(1, 10),
                  r8 = range(6, 10)
            remove(r7, r8)
            expect(r7).to.be.deep.equal([1, 2, 3, 4, 5])
        })
    })

    describe('Arrays.observeArray', () => {
        it('push', (done) => {
            const observeArray = feather.arrays.observeArray,
                  r1 = feather.arrays.range(1, 10)

            observeArray(r1, {

                reverse() {
                    throw Error('don\'t come here')
                },
                sort(indices: number[]) {
                    throw Error('don\'t come here')
                },
                splice(s: number, dc: number, added: number[], deleted: number[]) {
                    expect(r1.length).to.be.equal(13)
                    expect(r1[9]).to.be.equal(10)
                    expect(r1[10]).to.be.equal(1)
                    expect(r1[11]).to.be.equal(2)
                    expect(r1[12]).to.be.equal(3)
                    expect(s).to.be.equal(10)
                    expect(dc).to.be.equal(0)
                    expect(added.length).to.be.equal(3)
                    expect(deleted.length).to.be.equal(0)
                    done()
                }
            } as ArrayListener<number>)
            r1.push(1, 2, 3)
        })

        it('unshift', (done) => {
            const observeArray = feather.arrays.observeArray,
                  r1 = feather.arrays.range(1, 10)
            observeArray(r1, {
                reverse() {
                    throw Error('don\'t come here')
                },
                sort(indices: number[]) {
                    throw Error('don\'t come here')
                },
                splice(s: number, dc: number, added: number[], deleted: number[]) {
                    expect(r1.length).to.be.equal(13)
                    expect(r1[3]).to.be.equal(1)
                    expect(r1[12]).to.be.equal(10)
                    expect(r1[0]).to.be.equal(1)
                    expect(r1[1]).to.be.equal(2)
                    expect(r1[2]).to.be.equal(3)
                    expect(s).to.be.equal(0)
                    expect(dc).to.be.equal(0)
                    expect(added.length).to.be.equal(3)
                    expect(deleted.length).to.be.equal(0)
                    done()
                }
            } as ArrayListener<number>)
            r1.unshift(1, 2, 3)
        })

        it('pop', (done) => {
            const observeArray = feather.arrays.observeArray,
                  r1 = feather.arrays.range(1, 10)
            observeArray(r1, {
                reverse() {
                    throw Error('don\'t come here')
                },
                sort(indices: number[]) {
                    throw Error('don\'t come here')
                },
                splice(s: number, dc: number, added: number[], deleted: number[]) {
                    expect(r1.length).to.be.equal(9)
                    expect(r1[0]).to.be.equal(1)
                    expect(r1[8]).to.be.equal(9)
                    expect(s).to.be.equal(9)
                    expect(dc).to.be.equal(1)
                    expect(added.length).to.be.equal(0)
                    expect(deleted.length).to.be.equal(1)
                    done()
                }
            } as ArrayListener<number>)
            const res = r1.pop()
            expect(res).to.be.equal(10)
        })

        it('shift', (done) => {
            const observeArray = feather.arrays.observeArray,
                  r1 = feather.arrays.range(1, 10)
            observeArray(r1, {
                reverse() {
                    throw Error('don\'t come here')
                },
                sort(indices: number[]) {
                    throw Error('don\'t come here')
                },
                splice(s: number, dc: number, added: number[], deleted: number[]) {
                    expect(r1.length).to.be.equal(9)
                    expect(r1[0]).to.be.equal(2)
                    expect(r1[8]).to.be.equal(10)
                    expect(s).to.be.equal(0)
                    expect(dc).to.be.equal(1)
                    expect(added.length).to.be.equal(0)
                    expect(deleted.length).to.be.equal(1)
                    done()
                }
            } as ArrayListener<number>)
            r1.shift()
        })

        it('splice A', (done) => {
            const observeArray = feather.arrays.observeArray,
                  r1 = feather.arrays.range(1, 10)
            observeArray(r1, {
                reverse() {
                    throw Error('don\'t come here')
                },
                sort(indices: number[]) {
                    throw Error('don\'t come here')
                },
                splice(s: number, dc: number, added: number[], deleted: number[]) {
                    expect(r1.length).to.be.equal(10)
                    expect(r1[0]).to.be.equal(5)
                    expect(r1[4]).to.be.equal(1)
                    expect(s).to.be.equal(0)
                    expect(dc).to.be.equal(5)
                    expect(added.length).to.be.equal(5)
                    expect(deleted.length).to.be.equal(5)
                    done()
                }
            } as ArrayListener<number>)
            r1.splice(0, 5, 5, 4, 3, 2, 1)
        })

        it('splice B', (done) => {
            const observeArray = feather.arrays.observeArray,
                  r1 = feather.arrays.range(1, 10)
            observeArray(r1, {
                sort(indices: number[]) {
                    throw Error('don\'t come here')
                },
                splice(s: number, dc: number, added: number[], deleted: number[]) {
                    expect(r1.length).to.be.equal(10)
                    expect(r1[0]).to.be.equal(1)
                    expect(r1[5]).to.be.equal(5)
                    expect(r1[9]).to.be.equal(1)
                    expect(s).to.be.equal(5)
                    expect(dc).to.be.equal(5)
                    expect(added.length).to.be.equal(5)
                    expect(deleted.length).to.be.equal(5)
                    done()
                }
            } as ArrayListener<number>)
            r1.splice(5, 5, 5, 4, 3, 2, 1)
        })

        it('reverse', (done) => {
            const observeArray = feather.arrays.observeArray,
                  r1 = feather.arrays.range(1, 10)
            observeArray(r1, {
                sort(indices: number[]) {
                    expect(r1.length).to.be.equal(10)
                    expect(r1[0]).to.be.equal(10)
                    expect(r1[9]).to.be.equal(1)
                    done()
                },
                splice(s: number, dc: number, added: number[], deleted: number[]) {
                    throw Error('don\'t come here')
                }
            } as ArrayListener<number>)
            r1.reverse()
        })

        it('double reverse', (done) => {
            const observeArray = feather.arrays.observeArray,
                  r1 = feather.arrays.range(1, 10),
                  plan = new Plan(2, done)
            observeArray(r1, {
                sort(indices: number[]) {
                    if (plan.count === 1) {
                        expect(r1[0]).to.be.equal(1)
                        expect(r1[9]).to.be.equal(10)
                    }
                    plan.ok(true)
                },
                splice(s: number, dc: number, added: number[], deleted: number[]) {
                    throw Error('don\'t come here')
                }
            } as ArrayListener<number>)
            r1.reverse().reverse()
        })

        it('sort', (done) => {
            const observeArray = feather.arrays.observeArray,
                  r1 = [2, 5, 4, 3, 6, 1],
                  originalR1 = [2, 5, 4, 3, 6, 1],
                  r3 = []
            observeArray(r1, {
                sort(indices: number[]) {
                    expect(r1.length).to.be.equal(6)
                    expect(r1[0]).to.be.equal(Math.min.apply(null, r1))
                    expect(r1[5]).to.be.equal(Math.max.apply(null, r1))
                    expect(indices).to.be.deep.equal([ 5, 0, 3, 2, 1, 4 ])
                    indices.forEach((i, idx) => r3.push(originalR1[idx]))
                    expect(r3).to.be.deep.equal(originalR1)

                    done()
                },
                splice(s: number, dc: number, added: number[], deleted: number[]) {
                    throw Error('don\'t come here')
                }
            } as ArrayListener<number>)
            r1.sort((a, b) => a - b)
        })

        it('multiple listeners', (done) => {
            const observeArray = feather.arrays.observeArray,
                  plan = new Plan(4, done),
                  r1 = [2, 5, 4, 3, 6, 1]

            observeArray(r1, {
                sort(indices: number[]) {
                    plan.ok(true)
                },
                splice(s: number, dc: number, added: number[], deleted: number[]) {
                    throw Error('don\'t come here')
                }
            } as ArrayListener<number>)

            observeArray(r1, {
                sort(indices: number[]) {
                    plan.ok(true)
                },
                splice(s: number, dc: number, added: number[], deleted: number[]) {
                    throw Error('don\'t come here')
                }
            } as ArrayListener<number>)

            r1.sort((a, b) => a - b)
            r1.reverse()
        })
    })
})
