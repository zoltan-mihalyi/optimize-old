import {ObjectClass, FUNCTION, PropertyInfo} from "./ObjectClasses";
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

    protected abstract equalsInner(other:this):boolean;
}

export abstract class IterableValue extends Value {
    abstract each(callback:(value:SingleValue) => void):void;
}

export const enum ComparisonResult{
    TRUE,
    FALSE,
    UNKNOWN
}

function comparisonResultFromBoolean(bool:boolean):ComparisonResult {
    return bool ? ComparisonResult.TRUE : ComparisonResult.FALSE;
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

    abstract compareTo(other:SingleValue, strict:boolean):ComparisonResult;
}

export class KnownValue extends SingleValue {
    constructor(public value:any) {
        super();
    }

    protected equalsInner(other:KnownValue) {
        return other.value === this.value;
    }

    compareTo(other:SingleValue, strict:boolean):ComparisonResult {
        if (other instanceof KnownValue) {
            let equals = strict ? (this.value === other.value) : (this.value == other.value);
            return comparisonResultFromBoolean(equals);
        }
        if (strict) {
            return ComparisonResult.FALSE;
        }
        return ComparisonResult.UNKNOWN;
    }
}

export interface PropertyDescriptor {
    iterable:boolean;
    value:Value;
}

export type PropertyMap = {[idx:string]:PropertyDescriptor};

export class ObjectValue extends SingleValue {
    constructor(private objectClass:ObjectClass, private reference:Object, private knowAllProperties:boolean, private properties:PropertyMap = Object.create(null)) {
        super();
    }

    isFunction():boolean {
        return this.objectClass === FUNCTION;
    }

    isPropertyClean(property:any):boolean {
        const propertyDescriptor = this.properties[property];
        if (!propertyDescriptor) {
            return false;
        }
        const val = propertyDescriptor.value;
        if (val instanceof IterableValue) {
            let allClean = true;
            val.each(v => {
                if (v instanceof ObjectValue && v.objectClass === FUNCTION) {
                    allClean = false;
                }
            });
            return allClean;
        } else {
            return false;
        }
    }

    resolve(property:any):Value {
        const propertyDescriptor = this.properties[property];
        if (!propertyDescriptor) {
            return unknown;
        }
        return propertyDescriptor.value;
    }

    set(property:any, value:SingleValue|UnknownValue):ObjectValue {
        let map:PropertyMap = Object.create(null);
        for (let i in this.properties) {
            let descriptor = this.properties[i];
            map[i] = {
                value: descriptor.value,
                iterable: descriptor.iterable
            };
        }
        const info:PropertyInfo = {knowAllProperties: this.knowAllProperties};
        map = this.objectClass.onSet(map, info, property + '', value, true);
        return new ObjectValue(this.objectClass, this.reference, info.knowAllProperties, map);
    }

    noKnownProperties():ObjectValue {
        return new ObjectValue(this.objectClass, this.reference, false, Object.create(null));
    }

    protected equalsInner(other:ObjectValue):boolean {
        return this.objectClass == other.objectClass && this.equalsAllProps(other) && other.equalsAllProps(this);
    }

    compareTo(other:SingleValue, strict:boolean):ComparisonResult {
        if (other instanceof ObjectValue) {
            return comparisonResultFromBoolean(this.reference === other.reference);
        } else {
            return ComparisonResult.UNKNOWN;
        }
    }

    canIterate():boolean {
        return this.knowAllProperties;
    }

    iterate(callback:(i:string, value:Value) => void):void {
        for (let i in this.properties) {
            let propertyDescriptor = this.properties[i];
            if(propertyDescriptor.iterable) {
                callback(i, propertyDescriptor.value);
            }
        }
    }

    private equalsAllProps(other:ObjectValue):boolean {
        for (let i in this.properties) {
            if (!other.properties[i]) {
                return false;
            }
            if (!other.properties[i].value.equals(this.properties[i].value)) {
                return false;
            }
        }
        return true;
    }
}

export class FiniteSetOfValues extends IterableValue {
    static create(values:SingleValue[]):Value {
        const withoutDuplicates = unique(values);

        if (withoutDuplicates.length === 1) {
            return withoutDuplicates[0];
        }

        return new FiniteSetOfValues(withoutDuplicates);
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
            if (mapped) {
                mapped = mapped.or(value);
            } else {
                mapped = value;
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

    protected equalsInner(other:FiniteSetOfValues) {
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
        for (let i = 0; i < this.values.length; i++) {
            const left = this.values[i];
            for (let j = 0; j < other.values.length; j++) {
                const right = other.values[j];
                let value = mapper(left, right);
                if (mapped) {
                    mapped = mapped.or(value);
                } else {
                    mapped = value;
                }
            }
        }

        return mapped;
    }
}

function unique(values:SingleValue[]):SingleValue[] {
    const result = [values[0]];
    for (let i = 1; i < values.length; i++) {
        const value = values[i];
        if (!contains(result, value)) {
            result.push(value);
        }
    }
    return result;
}

function contains(values:SingleValue[], value:SingleValue):boolean {
    for (let i = 0; i < values.length; i++) {
        if (values[i].equals(value)) {
            return true;
        }
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

    protected equalsInner() {
        return true;
    }
}

export const unknown:UnknownValue = new UnknownValue();