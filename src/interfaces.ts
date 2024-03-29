interface Expression {
    type:string;
    calculatedValue?:any;
}

interface Literal extends Expression {
    value:any;
    raw:string;
}

interface BinaryExpression extends Expression {
    left:Expression;
    operator:string;
    right:Expression;
}

interface LogicalExpression extends BinaryExpression {
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

interface ArrowFunctionExpression extends FunctionExpression {
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
    kind:'var'|'const'|'let';
}

interface VariableDeclarator extends Expression {
    id:Identifier;
    init:Expression;
}

interface UpdateExpression extends Expression {
    argument:Expression;
    operator:string;
    prefix:boolean;
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
    property:Expression;
    computed:boolean;
}

interface StaticMemberExpression extends MemberExpression {
    property:Identifier;
    computed:false;
}

interface Directive extends Expression {
    directive:string;
    expression:Expression;
}

interface Loop extends Expression {
    body:Expression;
}

interface WhileStatement extends Loop {
    test:Expression;
}

interface ForStatement extends Loop {
    init:Expression;
    test:Expression;
    update:Expression;
}

interface DoWhileStatement extends WhileStatement {
}

interface LabeledStatement extends Expression {
    label:Identifier;
    body:Expression;
}

interface ContinueStatement extends Expression {
    label:Identifier;
}

interface TryStatement extends Expression {
    block:BlockStatement;
    handler:CatchClause;
    finalizer:BlockStatement;
}

interface BreakStatement extends Expression {
}

interface CatchClause extends Expression {
    param:Identifier;
    body:BlockStatement;
}

interface NewExpression extends CallExpression {
}

interface SwitchStatement extends Expression {
    discriminant:Expression;
    cases:SwitchCase[];
}

interface SwitchCase extends Expression {
    test:Expression;
    consequent:Expression[];
}

interface ThrowStatement extends Expression {
    argument:Expression;
}

interface ArrayExpression extends Expression {
    elements:Expression[];
}

interface Property extends Expression {
    computed:boolean;
    key:Expression;
    kind:'init';
    method:boolean;
    shorthand:boolean;
    value:Expression;
}

interface StaticProperty extends Property {
    computed:false;
    key:Identifier;
}

interface ThisExpression extends Expression {
}

interface ObjectExpression extends Expression {
    properties:Property[];
}

interface ForInStatement extends Expression {
    left:Expression;
    right:Expression;
    body:Expression;
}

interface ForOfStatement extends ForInStatement {
}

interface IfStatement extends ConditionalExpression {
}