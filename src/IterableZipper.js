export default class IteratorZipper {
    constructor(iter){
        this.iter = iter[Symbol.iterator]();
        this.head = { next: undefined, value: undefined };
        this.tail = { next: undefined, value: undefined };
        this.last = this.head;
        if(!this.add(this.iter.next())){console.log("EMPTY SEQUENCE?")};
    }
    add(value){
        this.last.next = { 
            next: undefined, 
            value: undefined 
        };
        this.last.value = value;
        this.last = this.last.next;
        return value.value !== undefined || !value.done;
    }
    next(){
        let temp = this.head.next;
        this.head.next = this.tail;
        this.tail = this.head;
        this.head = temp;
        if(this.head == this.last){
            this.add(this.iter.next());
        }
    }
    back(){
        let temp = this.tail.next;
        this.tail.next = this.head;
        this.head = this.tail;
        this.tail = temp;
    }
    hasNext(){
        if(this.head.next.next && !this.head.next.value.done){
            return true
        } else {
            return this.add(this.iter.next());
        }
    }
    proxy(){
        return new Proxy(this, {
            get: (trg, name) => trg.head.value[name],
            set: (trg, name, val) => { trg.head.value[name] = val; return true; },
            apply: (trg, __, args) => trg(...args),
        });
    }
};