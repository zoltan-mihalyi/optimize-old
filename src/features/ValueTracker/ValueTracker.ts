import {Feature} from "../../Feature";
import declarationPhase = require("./DeclarationPhase");
import updateAccessInfoPhase = require("./UpdateAccessInfoPhase");
import valueTrackingPhase = require("./ValueTrackingPhase");
import removeUnusedPhase = require("./RemoveUnusedPhase");
import removeRedundantVariablesPhase = require("./RemoveRedundantVariables");
import reduceTailRecursion = require("./ReduceTailRecursion");

const feature:Feature<any> = new Feature<any>();
declarationPhase(feature);
updateAccessInfoPhase(feature);
valueTrackingPhase(feature);
removeUnusedPhase(feature);
removeRedundantVariablesPhase(feature);
reduceTailRecursion(feature);

export = feature;