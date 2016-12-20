import {ValueMap, Value, SingleValue, UnknownValue, KnownValue} from "./Value";
export abstract class ObjectClass {
    abstract onSet(map:ValueMap, property:string, value:Value):ValueMap;
}

export class ObjectObjectClass extends ObjectClass {
    onSet(map:ValueMap, property:string, value:SingleValue|UnknownValue):ValueMap {
        map[property] = value;
        return map;
    }
}

export class FunctionObjectClass extends ObjectObjectClass {
}

export class ArrayObjectClass extends ObjectObjectClass {
    onSet(map:ValueMap, property:string, value:SingleValue|UnknownValue):ValueMap {
        if (property === 'length') {
            if (value instanceof KnownValue) {
                const length = +value.value;
                if (length >= 0 && length === length >> 0) {
                    removeArrayItems(map, i => i >= length)
                    value = new KnownValue(length);
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
                let length = map['length'];
                if (length instanceof KnownValue) {
                    let oldLength = length.value;
                    let newLength = oldLength <= propertyAsIndex ? propertyAsIndex + 1 : oldLength;
                    map['length'] = new KnownValue(newLength);
                }
            }
        }
        return super.onSet(map, property, value);
    }
}

function removeArrayItems(map:ValueMap, filter?:(i:number) => boolean) {
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