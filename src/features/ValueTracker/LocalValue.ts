import {Value} from "../../Value";
import Scope = require("../../Scope");

export interface ValueScope {
    expression:Expression;
    merge:MergeStrategy
}

export interface MergeStrategy {
    (oldValue:Value, newValue:Value):Value;
}

export interface LocalValue {
    scope:ValueScope;
    sources:Expression[];
    value:Value;
}