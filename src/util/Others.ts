import {
    isVariableDeclarator,
    isFunctionLike,
    isArrayExpression,
    isObjectExpression,
    isStaticProperty,
    isProperty,
    isMemberExpression,
    isAssignmentExpression,
    isLiteral,
    isUnaryExpression,
    isBlockScoped,
    isStaticMemberExpression
} from "./TypeCheckers";
import {Value, KnownValue, PropertyMap, ObjectValue, unknown} from "../Value";
import {ARRAY, FUNCTION, OBJECT} from "../ObjectClasses";
import AstNode = require("../AstNode");
import Variable = require("../features/ValueTracker/Variable");
export function isRealUsage(identifier:Identifier, parentExpression:Expression) {
    if (!isRealIdentifier(identifier, parentExpression)) {
        return false; //only property
    }

    if (isVariableDeclarator(parentExpression) && parentExpression.id === identifier) {
        return false; //just initializing
    }

    if (isFunctionLike(parentExpression)) {
        return false; //function declaration
    }
    return !isLHS(identifier, parentExpression);
}

export function getValueInformation(e:Expression):Value {
    if (e.calculatedValue) {
        return e.calculatedValue;
    }
    if (isLiteralLike(e)) {
        return new KnownValue(getLiteralLikeValue(e));
    }
    if (isArrayExpression(e)) {
        let map:PropertyMap = Object.create(null);
        for (let i = 0; i < e.elements.length; i++) {
            const element = e.elements[i];
            map[i] = {
                value: safeValue(element),
                iterable: true
            };
        }
        map['length'] = {
            value: new KnownValue(e.elements.length),
            iterable: false
        };

        return isClean(e) ? new ObjectValue(ARRAY, {}, true, map) : null;
    }
    if (isFunctionLike(e)) {
        return new ObjectValue(FUNCTION, {}, true);
    }
    if (isObjectExpression(e)) {
        let map:PropertyMap = Object.create(null);
        for (let i = 0; i < e.properties.length; i++) {
            const property = e.properties[i];
            if (isStaticProperty(property)) {
                map[property.key.name] = {
                    value: safeValue(property.value),
                    iterable: true
                };
            } else {
                map = void 0;
                break;
            }
        }
        return new ObjectValue(OBJECT, {}, true, map);
    }
    return null;
}

export function safeValue(e:Expression):Value {
    return getValueInformation(e) || unknown;
}

export function isClean(e:Expression) {
    if (isLiteralLike(e)) {
        return true;
    }
    if (isArrayExpression(e)) {
        for (let i = 0; i < e.elements.length; i++) {
            const element = e.elements[i];
            if (!isClean(element)) {
                return false;
            }
        }
        return true;
    }
    if (isObjectExpression(e)) {
        for (let i = 0; i < e.properties.length; i++) {
            const property = e.properties[i];
            if (property.computed && !isClean(property.key)) {
                return false;
            }
            if (!isClean(property.value)) {
                return false;
            }
        }
        return true;
    }
}

export function isRealIdentifier(expression:Expression, parentExpression:Expression):boolean {
    if (isProperty(parentExpression) && parentExpression.key === expression && !parentExpression.computed) {
        return false;
    }
    return !(isMemberExpression(parentExpression) && parentExpression.property === expression && !parentExpression.computed);
}

export function isLHS(expression:Expression, parentExpression:Expression):boolean {
    if (isAssignmentExpression(parentExpression)) {
        if (parentExpression.left === expression) {
            return true;
        }
    }
    return false;
}

function isLiteralLike(e:Expression):boolean {
    return isLiteral(e) || (isUnaryExpression(e) && e.operator === 'void' && isClean(e.argument));
}

function getLiteralLikeValue(e:Expression):boolean {
    if (isLiteral(e)) {
        return e.value;
    } else if (isUnaryExpression(e) && e.operator === 'void') {
        return void 0;
    }
}

export function isBlockScopedDeclarator(node:AstNode<VariableDeclarator, any>) {
    return isBlockScoped(node.parent.expression as VariableDeclaration);
}

export function isDeclared(node:AstNode<VariableDeclarator, Variable>):boolean {
    const id = node.expression.id;
    return isBlockScopedDeclarator(node) ? node.scope.hasInCurrentBlock(id) : node.scope.hasInCurrentFunction(id);
}

export function getPropertyValue(expression:MemberExpression) {
    return isStaticMemberExpression(expression) ? new KnownValue(expression.property.name) : safeValue(expression.property);
}

export function copy(o) {
    if (typeof o !== "object" || o === null) {
        return o;
    }

    if (Array.isArray(o)) {
        const result = [];
        for (let i = 0; i < o.length; i++) {
            result.push(copy(o[i]));
        }
        return result;
    }
    const result = {};
    for (let i in o) {
        if (Object.prototype.hasOwnProperty.call(o, i) && i !== 'loc' && i !== 'calculatedValue') {
            result[i] = copy(o[i]);
        }
    }
    return result;
}

function containsExpression(expression:Expression, predicate:(e:Expression) => boolean, visited:any[]) {
    if (visited.indexOf(expression) !== -1) {
        return false;
    }
    visited.push(expression);
    if (predicate(expression)) {
        return true;
    }
    for (let i in expression) {
        if (i === 'location' || i === 'orig') {
            continue;
        }
        if (expression[i]) {
            if (expression[i].type) {
                if (containsExpression(expression[i], predicate, visited)) {
                    return true;
                }
            } else if (expression[i].length) {
                if (containsArray(expression[i], predicate, visited)) {
                    return true;
                }
            }
        }
    }
    return false;
}

function containsArray(expressions:Expression[], predicate:(e:Expression) => boolean, visited:any[]) {
    if (visited.indexOf(expressions) !== -1) {
        return false;
    }
    visited.push(expressions);
    for (let i = 0; i < expressions.length; i++) {
        if (containsExpression(expressions[i], predicate, visited)) {
            return true;
        }
    }
    return false;
}

export function contains(e:Expression[]|Expression, predicate:(e:Expression) => boolean):boolean {
    if (Array.isArray(e)) {
        return containsArray(e, predicate, []);
    } else {
        return containsExpression(e, predicate, []);
    }
}