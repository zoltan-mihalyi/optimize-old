import {isFunctionDeclaration} from "./Util";
class Scope<T> {
    private store:{[idx:string]:T} = Object.create(null);
    private functionScope:boolean;


    constructor(private parentExpression:Expression, private parent:Scope<T>) {
        this.functionScope = parent === null || isFunctionDeclaration(parentExpression);
    }

    save(id:Identifier, object:T, letExpression:boolean):void {
        if (!letExpression && !this.functionScope) {
            this.parent.save(id, object, letExpression);
        }
        this.store[id.name] = object;
    }

    get(id:Identifier):T {
        if (Object.prototype.hasOwnProperty.call(this.store, id.name)) {
            return this.store[id.name];

        } else if (this.parent) {
            return this.parent.get(id);
        } else {
            return null;
        }
    }

    inside(fd:FunctionDeclaration):boolean {
        if (this.parentExpression === fd) {
            return true;
        } else if (this.parent) {
            return this.parent.inside(fd);
        }
        return false;
    }
}

export = Scope;