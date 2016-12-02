export abstract class Value {
    abstract map(mapper:(value:SingleValue)=>Value):Value;

    abstract or(value:Value):Value;

    abstract product(other:Value, mapper:(left:SingleValue, right:SingleValue)=>Value):Value;
}

abstract class SingleValue extends Value {
    or(value:Value):Value {
        if (value instanceof SingleValue) {
            return FiniteSetOfValues.create([this, value]);
        } else {
            return value.or(this);
        }
    }

    map(mapper:(value:SingleValue)=>Value):Value {
        return mapper(this);
    }

    product(other:Value, mapper:(left:SingleValue, right:SingleValue)=>Value):Value {
        return other.map(rval => mapper(this, rval));
    }
}

export class KnownValue extends SingleValue {
    constructor(public value:any) {
        super();
    }
}

export const enum ObjectClass {
    Function, Object, Array
}

export class ObjectValue extends SingleValue {
    constructor(public objectClass:ObjectClass) {
        super();
    }
}

export class FiniteSetOfValues extends Value {
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

    map(mapper:(value:SingleValue)=>Value):Value {
        var mapped:SingleValue[] = [];
        for (var i = 0; i < this.values.length; i++) {
            mapped.push(mapper(this.values[i]));
        }
        return FiniteSetOfValues.create(mapped);
    }

    product(other:Value, mapper:(left:SingleValue, right:SingleValue)=>Value):Value {
        if (other instanceof SingleValue) {
            return this.map(lval => mapper(lval, other));
        } else if (other instanceof FiniteSetOfValues) {
            return this.setProduct(other, mapper);
        } else {
            return other.product(this, mapper);
        }
    }

    private constructor(private values:SingleValue[]) {
        super();
    }

    private setProduct(other:FiniteSetOfValues, mapper:(left:SingleValue, right:SingleValue)=>Value):Value {
        var values:Value[] = [];
        for (var i = 0; i < this.values.length; i++) {
            var left = this.values[i];
            for (var j = 0; j < other.values.length; j++) {
                var right = other.values[j];
                values.push(mapper(left, right));
            }
        }

        return FiniteSetOfValues.create(values);
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
}

export var unknown:UnknownValue = new UnknownValue();