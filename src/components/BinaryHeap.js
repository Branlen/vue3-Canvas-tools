// 二叉小树堆
export class BinaryHeap {
    constructor(scoreFunction) {
        this.content = [];
        this.scoreFunction = scoreFunction || ((i) => i);
    }
    size() {
        return this.content.length;
    }
    push(item) {
        this.content.push(item)
        const n = this.size()
        this.slinkDown(n - 1)
    }
    pop() {
        const res = this.content[0];
        const end = this.content.pop();

        if (this.size() > 0) {
            this.content[0] = end;
            this.popUp(0)
        }
        return res;

    }
    remove() {

    }
    rescoreElement(node) {
        this.slinkDown(this.content.indexOf(node));
    }
    slinkDown(n) {
        const element = this.content[n];
        while (n > 0) {
            const parentN = ((n + 1) >> 1) - 1;
            const parent = this.content[parentN]


            if (this.scoreFunction(parent) > this.scoreFunction(element)) {
                this.content[parentN] = element;
                this.content[n] = parent;
                n = parentN;
            } else {
                break;
            }
        }
    }
    popUp(n) {
        const element = this.content[n]

        let length = this.size()
        while (true) {
            const childN2 = ((n + 1) << 1), childN1 = childN2 - 1;
            const child1 = this.content[childN1];
            const child2 = this.content[childN2];
            let swap = null
            if (childN1 < length) {
                if (this.scoreFunction(child1) < this.scoreFunction(element)) {
                    swap = childN1;
                }
            }
            if (childN2 < length) {
                if (this.scoreFunction(child2) < (swap !== null ? this.scoreFunction(child1) : this.scoreFunction(element))) {
                    swap = childN2;

                }
            }
            if (swap !== null) {
                this.content[n] = this.content[swap];
                this.content[swap] = element;
                n = swap;
            } else {
                break;
            }
        }


    }
    getContent() {
        return this.content;
    }
}

// const binaryHeap = new BinaryHeap()
// binaryHeap.push(1)
// binaryHeap.push(3)
// binaryHeap.push(2)
// binaryHeap.push(5)
// binaryHeap.push(2)
// binaryHeap.push(5)

// binaryHeap.pop();
// console.log(binaryHeap.getContent());