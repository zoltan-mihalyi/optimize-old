export abstract class Value {
    abstract map(mapper:(value:SingleValue) => Value):Value;

    abstract or(value:Value):Value;

    abstract product(other:Value, mapper:(left:SingleValue, right:SingleValue) => Value):Value;

    equals(other:Value):boolean {
        if (other.constructor !== this.constructor) {
            return false;
        }
        return this.equalsInner(other as this);
    }

    abstract equalsInner(other:this):boolean;
}

export abstract class IterableValue extends Value {
    abstract each(callback:(value:SingleValue) => void):void;
}

export abstract class SingleValue extends IterableValue {
    or(value:Value):Value {
        if (value instanceof SingleValue) {
            return FiniteSetOfValues.create([this, value]);
        } else {
            return value.or(this);
        }
    }

    map(mapper:(value:SingleValue) => Value):Value {
        return mapper(this);
    }

    each(callback:(value:SingleValue) => void):void {
        callback(this);
    }

    product(other:Value, mapper:(left:SingleValue, right:SingleValue) => Value):Value {
        return other.map(rval => mapper(this, rval));
    }
}

export class KnownValue extends SingleValue {
    constructor(public value:any) {
        super();
    }

    equalsInner(other:KnownValue) {
        return other.value === this.value;
    }
}

export const enum ObjectClass {
    Function, Object
}

export type ValueMap = {[idx:string]:Value};

export class ObjectValue extends SingleValue {
    constructor(public objectClass:ObjectClass, private properties:ValueMap = Object.create(null)) {
        super();
    }

    isPropertyClean(property:string):boolean {
        return Object.prototype.hasOwnProperty.call(this.properties, property);
    }

    resolve(property:string):Value {
        return this.properties[property] || unknown;
    }

    set(property:any, value:Value):ObjectValue {
        const map:ValueMap = Object.create(null);
        for (let i in this.properties) {
            map[i] = this.properties[i];
        }
        map[property] = value;
        return new ObjectValue(this.objectClass, map);
    }

    noKnownProperties():ObjectValue {
        return new ObjectValue(this.objectClass, Object.create(null));
    }

    equalsInner(other:ObjectValue):boolean {
        return this.equalsAllProps(other) && other.equalsAllProps(this);
    }

    private equalsAllProps(other:ObjectValue):boolean {
        for (let i in this.properties) {
            if (!other.properties[i]) {
                return false;
            }
            if (!other.properties[i].equals(this.properties[i])) {
                return false;
            }
        }
        return true;
    }
}

export class FiniteSetOfValues extends IterableValue {
    static create(values:SingleValue[]):Value {
        if (allSameAndKnown(values)) {
            return values[0];
        }
        return new FiniteSetOfValues(values);
    }

    or(value:Value):Value {
        if (value instanceof SingleValue) {
            return FiniteSetOfValues.create([...this.values, value]);
        } else if (value instanceof FiniteSetOfValues) {
            return FiniteSetOfValues.create([...this.values, ...value.values]);
        } else {
            return value.or(this);
        }
    }

    map(mapper:(value:SingleValue) => Value):Value {
        let mapped:Value;
        for (let i = 0; i < this.values.length; i++) {
            let value = mapper(this.values[i]);
            if (!mapped) {
                mapped = value;
            } else {
                mapped = mapped.or(value);
            }
        }
        return mapped;
    }

    each(callback:(value:SingleValue) => void):void {
        for (let i = 0; i < this.values.length; i++) {
            callback(this.values[i]);
        }
    }

    product(other:Value, mapper:(left:SingleValue, right:SingleValue) => Value):Value {
        if (other instanceof SingleValue) {
            return this.map(lval => mapper(lval, other));
        } else if (other instanceof FiniteSetOfValues) {
            return this.setProduct(other, mapper);
        } else {
            return other.product(this, mapper);
        }
    }

    equalsInner(other:FiniteSetOfValues) {
        if (this.values.length !== other.values.length) {
            return false;
        }
        for (let i = 0; i < this.values.length; i++) {
            if (!this.values[i].equals(other.values[i])) {
                return false;
            }
        }
        return true;
    }

    private constructor(private values:SingleValue[]) {
        super();
    }

    private setProduct(other:FiniteSetOfValues, mapper:(left:SingleValue, right:SingleValue) => Value):Value {
        let mapped:Value;
        for (var i = 0; i < this.values.length; i++) {
            var left = this.values[i];
            for (var j = 0; j < other.values.length; j++) {
                var right = other.values[j];
                let value = mapper(left, right);
                if (!mapped) {
                    mapped = value;
                } else {
                    mapped = mapped.or(value);
                }
            }
        }

        return mapped;
    }
}

function allSameAndKnown(values:SingleValue[]):boolean {
    var first = values[0];
    if (first instanceof KnownValue) {
        for (var i = 1; i < values.length; i++) {
            var value = values[i];
            if (value instanceof KnownValue) {
                if (first.value !== value.value) {
                    return false;
                }
            } else {
                return false;
            }
        }
        return true;
    }
    return false;
}

export class UnknownValue extends Value {
    or():Value {
        return this;
    }

    map():Value {
        return this;
    }

    product():Value {
        return this;
    }

    equalsInner(other:UnknownValue) {
        return true;
    }
}

export var unknown:UnknownValue = new UnknownValue();