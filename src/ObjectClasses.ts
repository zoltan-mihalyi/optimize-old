import {PropertyMap, Value, SingleValue, UnknownValue, KnownValue} from "./Value";

export interface ObjectClass {
    onSet(map:PropertyMap, property:string, value:Value, iterable:boolean):PropertyMap;
}

class ObjectObjectClass implements ObjectClass {
    onSet(map:PropertyMap, property:string, value:SingleValue|UnknownValue, iterable:boolean):PropertyMap {
        map[property] = {
            iterable: iterable,
            value: value
        };
        return map;
    }
}

export const OBJECT:ObjectClass = new ObjectObjectClass();

class FunctionObjectClass extends ObjectObjectClass {
}

export const FUNCTION = new FunctionObjectClass();

class ArrayObjectClass extends ObjectObjectClass {
    onSet(map:PropertyMap, property:string, value:SingleValue|UnknownValue, iterable:boolean):PropertyMap {
        if (property === 'length') {
            if (value instanceof KnownValue) {
                const length = +value.value;
                if (length >= 0 && length === length >> 0) {
                    removeArrayItems(map, i => i >= length);
                    value = new KnownValue(length);
                    iterable = false;
                } else { //assignment throws an error
                    return map;
                }
            } else { //object or unknown
                removeArrayItems(map);
                delete map['length'];
                return map;
            }
        } else {
            const propertyAsIndex = toNumber(property);
            if (propertyAsIndex !== null) {
                let lengthDescriptor = map['length'];
                if (lengthDescriptor) {
                    let lengthValue = lengthDescriptor.value;
                    if (lengthValue instanceof KnownValue) {
                        let oldLength = lengthValue.value;
                        let newLength = oldLength <= propertyAsIndex ? propertyAsIndex + 1 : oldLength;
                        lengthDescriptor.value = new KnownValue(newLength);
                    }
                }
            }
        }
        return super.onSet(map, property, value, iterable);
    }
}

function removeArrayItems(map:PropertyMap, filter?:(i:number) => boolean) {
    for (let i in map) {
        const index = toNumber(i);
        if (index !== null) {
            if (!filter || filter(index)) {
                delete map[i];
            }
        }
    }
}

function toNumber(value:string):number {
    const asNumber = +value >> 0;
    if (asNumber + '' === value && asNumber >= 0) {
        return asNumber;
    }
    return null;
}

export const ARRAY = new ArrayObjectClass();