import {KnownValue, Value, ObjectValue, ObjectType, ValueMap, unknown} from "./Value";
import {ObjectObjectClass, FunctionObjectClass, ArrayObjectClass} from "./ObjectClasses";
import AstNode = require("./AstNode");
import Variable = require("./features/ValueTracker/Variable");
export function isLiteral(e:Expression):e is Literal {
    return e.type === 'Literal';
}

export function isDirective(e:Expression):e is Directive {
    return typeof (e as any).directive === 'string';
}

export function isIdentifier(e:Expression):e is Identifier {
    return e.type === 'Identifier';
}

export function isBlockStatement(e:Expression):e is BlockStatement {
    return e.type === 'BlockStatement';
}

export function isBlockStatementLike(e:Expression):e is BlockStatement {
    return isBlockStatement(e) || isProgram(e);
}

function isFunctionDeclaration(e:Expression):e is FunctionDeclaration {
    return e.type === 'FunctionDeclaration';
}

function isFunctionExpression(e:Expression):e is FunctionExpression {
    return e.type === 'FunctionExpression';
}

function isArrowFunctionExpression(e:Expression):e is ArrowFunctionExpression {
    return e.type === 'ArrowFunctionExpression';
}

export function isFunctionLike(e:Expression):e is FunctionDeclaration {
    return isFunctionDeclaration(e) || isFunctionExpression(e) || isArrowFunctionExpression(e);
}

export function isBinaryExpressionLike(e:Expression):e is BinaryExpression {
    return isBinaryExpression(e) || isLogicalExpression(e);
}

export function isBinaryExpression(e:Expression):e is BinaryExpression {
    return e.type === 'BinaryExpression';
}

export function isUnaryExpression(e:Expression):e is UnaryExpression {
    return e.type === 'UnaryExpression';
}

export function isLogicalExpression(e:Expression):e is LogicalExpression {
    return e.type === 'LogicalExpression';
}

export function isProgram(e:Expression):e is Program {
    return e.type === 'Program';
}

export function isReturnStatement(e:Expression):e is ReturnStatement {
    return e.type === 'ReturnStatement';
}

export function isAssignmentExpression(e:Expression):e is AssignmentExpression {
    return e.type === 'AssignmentExpression';
}

export function isForInStatement(e:Expression):e is ForInStatement {
    return e.type === 'ForInStatement';
}

export function isForOfStatement(e:Expression):e is ForOfStatement {
    return e.type === 'ForOfStatement';
}

export function isForInStatementLike(e:Expression):e is ForInStatement {
    return isForInStatement(e) || isForOfStatement(e);
}

export function isVariableDeclarator(e:Expression):e is VariableDeclarator {
    return e.type === 'VariableDeclarator';
}

export function isVariableDeclaration(e:Expression):e is VariableDeclaration {
    return e.type === 'VariableDeclaration';
}

export function isCallExpression(e:Expression):e is CallExpression {
    return e.type === 'CallExpression';
}

export function isNewExpression(e:Expression):e is NewExpression {
    return e.type === 'NewExpression';
}

export function isThrow(e:Expression):e is ThrowStatement {
    return e.type === 'ThrowStatement';
}

export function isSwitch(e:Expression):e is SwitchStatement {
    return e.type === 'SwitchStatement';
}

export function isCase(e:Expression):e is SwitchCase {
    return e.type === 'SwitchCase';
}

export function isUpdateExpression(e:Expression):e is UpdateExpression {
    return e.type === 'UpdateExpression';
}

export function isExpressionStatement(e:Expression):e is ExpressionStatement {
    return e.type === 'ExpressionStatement';
}

export function isWhileStatement(e:Expression):e is WhileStatement {
    return e.type === 'WhileStatement';
}

export function isDoWhileStatement(e:Expression):e is DoWhileStatement {
    return e.type === 'DoWhileStatement';
}

export function isForStatement(e:Expression):e is ForStatement {
    return e.type === 'ForStatement';
}

export function isArrayExpression(e:Expression):e is ArrayExpression {
    return e.type === 'ArrayExpression';
}

export function isMemberExpression(e:Expression):e is MemberExpression {
    return e.type === 'MemberExpression';
}

export function isStaticMemberExpression(e:MemberExpression):e is StaticMemberExpression {
    return !e.computed;
}

export function isIfStatement(e:Expression):e is IfStatement {
    return e.type === 'IfStatement';
}

export function isConditionalExpression(e:Expression):e is ConditionalExpression {
    return e.type === 'ConditionalExpression';
}

export function isLabeledStatement(e:Expression):e is LabeledStatement {
    return e.type === 'LabeledStatement';
}

export function isObjectExpression(e:Expression):e is ObjectExpression {
    return e.type === 'ObjectExpression';
}

export function isProperty(e:Expression):e is Property {
    return e.type === 'Property';
}

export function isStaticProperty(e:Property):e is StaticProperty {
    return e.computed === false;
}

export function isThis(e:Expression) {
    return e.type === 'ThisExpression';
}

export function isTryStatement(e:Expression):e is TryStatement {
    return e.type === 'TryStatement';
}

export function isBreak(e:Expression):e is BreakStatement {
    return e.type === 'BreakStatement';
}

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
        let map:ValueMap = Object.create(null);
        for (let i = 0; i < e.elements.length; i++) {
            const element = e.elements[i];
            map[i] = safeValue(element);
        }
        map['length'] = new KnownValue(e.elements.length);

        return isClean(e) ? new ObjectValue(ObjectType.Object, new ArrayObjectClass(), {}, map) : null;
    }
    if (isFunctionLike(e)) {
        return new ObjectValue(ObjectType.Function, new FunctionObjectClass(), {});
    }
    if (isObjectExpression(e)) {
        let map:ValueMap = Object.create(null);
        for (let i = 0; i < e.properties.length; i++) {
            const property = e.properties[i];
            if (isStaticProperty(property)) {
                map[property.key.name] = safeValue(property.value);
            } else {
                map = void 0;
                break;
            }
        }
        return new ObjectValue(ObjectType.Object, new ObjectObjectClass(), {}, map);
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

export function isLoop(e):e is Loop {
    return isWhileStatement(e) || isForInStatement(e) || isForOfStatement(e) || isForStatement(e) || isDoWhileStatement(e);
}

function getLiteralLikeValue(e:Expression):boolean {
    if (isLiteral(e)) {
        return e.value;
    } else if (isUnaryExpression(e) && e.operator === 'void') {
        return void 0;
    }
}

export function isBlockScoped(node:AstNode<VariableDeclarator, any>) {
    return (node.parent.expression as VariableDeclaration).kind !== 'var';
}

export function isDeclared(node:AstNode<VariableDeclarator, Variable>):boolean {
    const id = node.expression.id;
    return isBlockScoped(node) ? node.scope.hasInCurrentBlock(id) : node.scope.hasInCurrentFunction(id);
}

export function getPropertyValue(expression:MemberExpression) {
    return isStaticMemberExpression(expression) ? new KnownValue(expression.property.name) : safeValue(expression.property);
}

export function returnStatement(argument?:Expression):ReturnStatement {
    return {
        type: 'ReturnStatement',
        argument: argument
    };
}

export function literalLike(value:any):Expression {
    if (value === void 0) {
        return unaryExpression('void', true, literal(0));
    }
    return literal(value);
}

export function unaryExpression(operator:string, prefix:boolean, argument:Expression):UnaryExpression {
    return {
        type: 'UnaryExpression',
        operator: operator,
        argument: argument,
        prefix: prefix
    };
}

export function literal(value:number):Literal {
    return {
        type: 'Literal',
        value: value,
        raw: value + ''
    };
}

export function whileStatement(test:Expression, body:Expression):WhileStatement {
    return {
        type: 'WhileStatement',
        test: test,
        body: body
    };
}

export function identifier(name:string):Identifier {
    return {
        type: 'Identifier',
        name: name
    };
}

export function labeled(name:string, body:Expression):LabeledStatement {
    return {
        type: 'LabeledStatement',
        body: body,
        label: identifier(name)
    };
}

export function block(body:Expression[]):BlockStatement {
    return {
        type: 'BlockStatement',
        body: body
    };
}

export function update(argument:Expression, operator:string, prefix:boolean):UpdateExpression {
    return {
        type: 'UpdateExpression',
        prefix: prefix,
        operator: operator,
        argument: argument
    };
}


export function continueStatement(name:string):ContinueStatement {
    return {
        type: 'ContinueStatement',
        label: identifier(name)
    };
}

export function declarator(name:string, init?:Expression):VariableDeclarator {
    return {
        type: 'VariableDeclarator',
        id: identifier(name),
        init: init
    };
}

export function declaration(declarations:VariableDeclarator[], kind?:'var'|'let'|'const'):VariableDeclaration {
    return {
        type: 'VariableDeclaration',
        kind: kind || 'var',
        declarations: declarations
    };
}

export function expressionStatement(expression:Expression):ExpressionStatement {
    return {
        type: 'ExpressionStatement',
        expression: expression
    };
}

export function assignment(left:Expression, right:Expression):ExpressionStatement {
    return {
        type: 'ExpressionStatement',
        expression: {
            type: 'AssignmentExpression',
            operator: '=',
            left: left,
            right: right
        } as AssignmentExpression
    };
}

export function binaryExpression(operator:string, left:Expression, right:Expression):BinaryExpression {
    return {
        type: 'BinaryExpression',
        operator: operator,
        left: left,
        right: right
    };
}

export function call(callee:Expression, args:Expression[]):CallExpression {
    return {
        type: 'CallExpression',
        callee: callee,
        arguments: args
    };
}

export function callNew(callee:Expression, args:Expression[]):CallExpression {
    return {
        type: 'NewExpression',
        callee: callee,
        arguments: args
    };
}

export function throwStatement(argument:Expression):ThrowStatement {
    return {
        type: 'ThrowStatement',
        argument: argument
    };
}

export function switchStatement(discriminant:Expression, cases:SwitchCase[]):SwitchStatement {
    return {
        type: 'SwitchStatement',
        discriminant: discriminant,
        cases: cases
    };
}

export function memberExpression(object:Expression, property:Identifier, computed:boolean):MemberExpression {
    return {
        type: 'MemberExpression',
        object: object,
        property: property,
        computed: computed
    };
}

export function ifStatement(test:Expression, consequent:Expression, alternate:Expression):IfStatement {
    return {
        type: 'IfStatement',
        test: test,
        consequent: consequent,
        alternate: alternate
    };
}

export function array(elements:Expression[]):ArrayExpression {
    return {
        type: 'ArrayExpression',
        elements: elements
    };
}

export function forStatement(init:Expression, test:Expression, update:Expression, body:Expression):ForStatement {
    return {
        type: 'ForStatement',
        init: init,
        test: test,
        update: update,
        body: body
    };
}

export function forInStatement(left:Expression, right:Expression, body:Expression, of:boolean):ForInStatement {
    return {
        type: of ? 'ForOfStatement' : 'ForInStatement',
        left: left,
        right: right,
        body: body
    };
}

export function conditional(test:Expression, consequent:Expression, alternate:Expression):ConditionalExpression {
    return {
        type: 'ConditionalExpression',
        test: test,
        consequent: consequent,
        alternate: alternate
    };
}

export function object(properties:Property[]):ObjectExpression {
    return {
        type: 'ObjectExpression',
        properties: properties
    };
}

export function property(key:Expression, value:Expression, method:boolean, kind:'init', shorthand:boolean, computed:boolean):Property {
    return {
        type: 'Property',
        key: key,
        value: value,
        method: method,
        kind: kind,
        shorthand: shorthand,
        computed: computed
    };
}