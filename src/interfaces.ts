interface Expression {
    type:string;
}

interface Literal extends Expression {
    value:number|string;
    raw:string;
}

interface BinaryExpression extends Expression {
    left:Expression;
    operator:string;
    right:Expression;
}

interface UnaryExpression extends Expression {
    argument:Expression;
    operator:string;
    prefix:boolean;
}

interface Identifier extends Expression {
    name:string;
}

interface ConditionalExpression extends Expression {
    test:Expression;
    consequent:Expression;
    alternate:Expression;
}

interface FunctionDeclaration extends Expression {
    id:Identifier;
    params:Identifier[];
    body:BlockStatement;
}

interface FunctionExpression extends FunctionDeclaration {
}

interface BlockStatement extends Expression {
    body:Expression[];
}

interface Program extends BlockStatement {
    errors:any[];
    sourceType:string;
}

interface ReturnStatement extends Expression {
    argument:Expression;
}

interface ExpressionStatement extends Expression {
    expression:Expression;
}

interface VariableDeclaration extends Expression {
    declarations:VariableDeclarator[];
    kind:'var'|'const';
}

interface VariableDeclarator extends Expression {
    id:Identifier;
    init:Expression;
}

interface CallExpression extends Expression {
    callee:Expression;
    arguments:Expression[];
}

interface AssignmentExpression extends Expression {
    left:Expression;
    operator:string;
    right:Expression;
}

interface MemberExpression extends Expression {
    object:Expression;
    property:Identifier;
    computed:boolean;
}

interface Directive extends Expression {
    directive:string;
    expression:Expression;
}


