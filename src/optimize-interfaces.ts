interface OptimizeOptions {
    maxGrowth:number;
    maxTotalGrowth:number;
}

interface OptimizeContext {
    options:OptimizeOptions;
    growth:number;
    changed:boolean;
}