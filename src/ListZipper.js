export default class ListZipper {
    constructor(){
        this.head = { next: undefined, value: undefined };
        this.tail = { next: undefined, value: undefined };
        this.last = this.head;
    }
    push(value){
        this.head.next = { 
            next: this.head.next, 
            value: this.head.value 
        };
        this.head.value = value;
    }
    add(value){
        this.last.next = { 
            next: undefined, 
            value: undefined 
        };
        this.last.value = value;
        this.last = this.last.next;
    }
    pop(){
        let value = this.head.value;
        this.head = this.head.next;
        return value;
    }
    shift(){
        let temp = this.head.next;
        this.head.next = this.tail;
        this.tail = this.head;
        this.head = temp;
        return this.head.value;
    }
    unShift(){
        let temp = this.tail.next;
        this.tail.next = this.head;
        this.head = this.tail;
        this.tail = temp;
        return this.head.value;
    }
};

ListZipper.prototype[Symbol.iterator] = function*(){
    let next = this.head;
    while(next.next){
        yield next.value;
        next = next.next;
    }
};