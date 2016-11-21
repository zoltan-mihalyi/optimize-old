import {KnownValue, Value, ObjectValue, ObjectClass} from "./Value";
import AstNode = require("./AstNode");
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

export function isVariableDeclarator(e:Expression):e is VariableDeclarator {
    return e.type === 'VariableDeclarator';
}

export function isVariableDeclaration(e:Expression):e is VariableDeclaration {
    return e.type === 'VariableDeclaration';
}

export function isCallExpression(e:Expression):e is CallExpression {
    return e.type === 'CallExpression';
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

export function getValueInformation(e:Expression):Value {
    if (e.calculatedValue) {
        return e.calculatedValue;
    }
    if (isLiteralLike(e)) {
        return new KnownValue(getLiteralLikeValue(e));
    }
    if (isArrayExpression(e)) {
        return isClean(e) ? new ObjectValue(ObjectClass.Array) : null;
    }
    if (isFunctionLike(e)) {
        return new ObjectValue(ObjectClass.Function);
    }
    return null;
}

function isClean(e:Expression) {
    if (isLiteralLike(e)) {
        return true;
    }
    if (isArrayExpression(e)) {
        for (var i = 0; i < e.elements.length; i++) {
            var element = e.elements[i];
            if (!isClean(element)) {
                return false;
            }
        }
        return true;
    }
}

export function isLiteralLike(e:Expression):boolean {
    return isLiteral(e) || (isUnaryExpression(e) && e.operator === 'void' && isLiteral(e.argument));
}

export function isLoop(e) {
    return isWhileStatement(e) || isForInStatement(e) || isForOfStatement(e) || isForStatement(e) || isDoWhileStatement(e);
}

function getLiteralLikeValue(e:Expression):boolean {
    if (isLiteral(e)) {
        return e.value;
    } else if (isUnaryExpression(e) && e.operator === 'void') {
        return void 0;
    } else {
        throw new Error('Cannot determine value');
    }
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

export function declaration(declarations:VariableDeclarator[]):VariableDeclaration {
    return {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: declarations
    };
}

export function assignment(left:Expression, right:Expression):ExpressionStatement {
    var assignment:AssignmentExpression = {
        type: 'AssignmentExpression',
        operator: '=',
        left: left,
        right: right
    };


    return {
        type: 'ExpressionStatement',
        expression: assignment
    };
}