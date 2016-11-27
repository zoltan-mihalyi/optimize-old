import {Value} from "../../Value";
interface LocalValue {
    scope:Expression;
    sources:Expression[];
    value:Value;
}

export = LocalValue;