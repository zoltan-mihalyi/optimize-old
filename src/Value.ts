export abstract class Value {
    abstract map(mapper:(value)=>any):Value;

    abstract or(value:Value):Value;

    abstract product(other:Value, mapper:(left, right)=>any):Value;
}

export class KnownValue extends Value {

    constructor(public value:any) {
        super();
    }

    or(value:Value):Value {
        if (value instanceof KnownValue) {
            return FiniteSetOfValues.create([this.value, value.value]);
        } else {
            return value.or(this);
        }
    }

    map(mapper:(value)=>any):Value {
        return new KnownValue(mapper(this.value));
    }

    product(other:Value, mapper:(left, right)=>any):Value {
        return other.map(rval=>mapper(this.value, rval));
    }
}

export class FiniteSetOfValues extends Value {
    private constructor(private values:any[]) {
        super();
    }

    or(value:Value):Value {
        if (value instanceof KnownValue) {
            return FiniteSetOfValues.create([value.value, ...this.values]);
        } else if (value instanceof FiniteSetOfValues) {
            return FiniteSetOfValues.create([...value.values, ...this.values]);
        } else {
            return value.or(this);
        }
    }

    map(mapper:(value)=>any):Value {
        var mapped:any[] = [];
        for (var i = 0; i < this.values.length; i++) {
            mapped.push(mapper(this.values[i]));
        }
        return FiniteSetOfValues.create(mapped);
    }

    product(other:Value, mapper:(left, right)=>any):Value {
        if (other instanceof KnownValue) {
            return this.map(lval=>mapper(lval, other.value));
        } else if (other instanceof FiniteSetOfValues) {
            return this.setProduct(other, mapper);
        }
    }

    private setProduct(other:FiniteSetOfValues, mapper:(left, right)=>any):Value {
        var values = [];
        for (var i = 0; i < this.values.length; i++) {
            var left = this.values[i];
            for (var j = 0; j < other.values.length; j++) {
                var right = other.values[j];
                values.push(mapper(left, right));
            }
        }

        return FiniteSetOfValues.create(values);
    }

    static create(values:any[]):Value {
        var first = values[0];
        for (var i = 1; i < values.length; i++) {
            if (values[i] !== first) {
                return new FiniteSetOfValues(values);
            }
        }
        return new KnownValue(first);
    }
}

export class UnknownValue extends Value {
    or(value:Value):Value {
        return this;
    }

    map(mapper):Value {
        return this;
    }

    product():Value {
        return this;
    }
}

export var unknown:UnknownValue = new UnknownValue();