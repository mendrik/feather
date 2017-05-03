import {assert, expect, featherStart} from './test-head'

function Plan(count, done) {
    this.done = done;
    this.count = count;
}

Plan.prototype.ok = function(expression) {
    assert(expression);

    if (this.count === 0) {
        assert(false, 'Too many assertions called');
    } else {
        this.count--;
    }

    if (this.count === 0) {
        this.done();
    }
}

describe('Arrays', () => {
    let window, app, ef;

    before(done => {
        featherStart(r => {
            window = r.window
            app = r.app
            ef = r.ef
        });
        done();
    })

    describe('Arrays.from', () => {

        it('should convert DomList', () => {
            let spans = window.document.querySelectorAll('span'),
                asArray = feather.arrays.from(spans)
            expect(asArray.length).to.be.equal(spans.length)
            expect(Array.isArray(asArray)).to.be.true
        })

        it('should copy array', () => {
            let arr = feather.arrays.range(5, 10),
                copy = feather.arrays.from(arr)
            copy[0] = 1;
            expect(Array.isArray(copy)).to.be.true
            expect(copy.length).to.be.equal(arr.length)
            expect(arr[0]).to.be.equal(5)
        })
    })

    describe('Arrays.range', () => {
        it('should create range', () => {
            let r1 = feather.arrays.range(5, 10)
            expect(r1.length).to.be.equal(6)
            expect(r1[0]).to.be.equal(5)
            expect(r1[r1.length - 1]).to.be.equal(10)
        })
    })

    describe('Arrays.diff', () => {
        it('should diff correctly', () => {
            let r1 = feather.arrays.range(2, 10),
                r2 = feather.arrays.range(4, 8),
                diff = feather.arrays.diff(r1, r2)
            expect(diff).to.be.deep.equal([2, 3, 9, 10])
        })
    })

    describe('Arrays.lis', () => {
        it('should find longest increasing sequence', () => {
            let r1 = [1, 4, 8, -7, 2, 5, 3, 7, 9, 6, 10, 0, 13, 8]
            expect(feather.arrays.lis(r1)).to.be.deep.equal([1, 4, 5, 7, 9, 10, 13])
            let r2 = [0,3,1,2]
            expect(feather.arrays.lis(r2)).to.be.deep.equal([0, 1, 2])
        })
    })

    describe('Arrays.patch', () => {
        it('should find a patch', () => {
            let current = ["a", "b", "e", "f"],
                target = ["a", "c", "d", "f"],

            patch = feather.arrays.patch(target, current);
            expect(patch.add).to.be.deep.equal(["c", "d"])
            expect(patch.remove).to.be.deep.equal(["b", "e"])
        })
    })

    describe('Arrays.flatten', () => {
        it('should flatten arrays', () => {
            let r1 = [[1,2],[3,4],[5, [6, 7]]]
            expect(feather.arrays.flatten(r1)).to.be.deep.equal([1,2,3,4,5,[6,7]])
        })
    })

    describe('Arrays.observeArray', () => {
        it('push', (done) => {
            let observeArray = feather.arrays.observeArray,
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
            } as feather.arrays.ArrayListener<number>)
            r1.push(1, 2, 3)
        })

        it('unshift', (done) => {
            let observeArray = feather.arrays.observeArray,
                r1 = feather.arrays.range(1, 10);
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
                } as feather.arrays.ArrayListener<number>)
                r1.unshift(1, 2, 3)
        })

        it('pop', (done) => {
            let observeArray = feather.arrays.observeArray,
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
            } as feather.arrays.ArrayListener<number>)
            r1.pop()
        })

        it('shift', (done) => {
            let observeArray = feather.arrays.observeArray,
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
            } as feather.arrays.ArrayListener<number>)
            r1.shift()
        })

        it('splice A', (done) => {
            let observeArray = feather.arrays.observeArray,
                r1 = feather.arrays.range(1, 10);
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
                } as feather.arrays.ArrayListener<number>)
                r1.splice(0, 5, 5, 4, 3, 2, 1)
        })

        it('splice B', (done) => {
            let observeArray = feather.arrays.observeArray,
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
            } as feather.arrays.ArrayListener<number>)
            r1.splice(5, 5, 5, 4, 3, 2, 1)
        })

        it('reverse', (done) => {
            let observeArray = feather.arrays.observeArray,
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
            } as feather.arrays.ArrayListener<number>)
            r1.reverse()
        })

        it('double reverse', (done) => {
            let observeArray = feather.arrays.observeArray,
                r1 = feather.arrays.range(1, 10)
            observeArray(r1, {
                sort(indices: number[]) {
                    expect(r1[0]).to.be.equal(1)
                    expect(r1[9]).to.be.equal(10)
                    done()
                },
                splice(s: number, dc: number, added: number[], deleted: number[]) {
                    throw Error('don\'t come here')
                }
            } as feather.arrays.ArrayListener<number>)
            r1.reverse().reverse()
        })

        it('sort', (done) => {
            let observeArray = feather.arrays.observeArray,
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
            } as feather.arrays.ArrayListener<number>)
            r1.sort((a, b) => a - b)
        })

        it('multiple listeners', (done) => {
            let observeArray = feather.arrays.observeArray,
                plan = new Plan(4, done),
                r1 = [2, 5, 4, 3, 6, 1];

            observeArray(r1, {
                sort(indices: number[]) {
                    plan.ok(true)
                },
                splice(s: number, dc: number, added: number[], deleted: number[]) {
                    throw Error('don\'t come here')
                }
            } as feather.arrays.ArrayListener<number>)

            observeArray(r1, {
                sort(indices: number[]) {
                    plan.ok(true)
                },
                splice(s: number, dc: number, added: number[], deleted: number[]) {
                    throw Error('don\'t come here')
                }
            } as feather.arrays.ArrayListener<number>)

            r1.sort((a, b) => a - b)
            r1.reverse()
        })
    })
})
