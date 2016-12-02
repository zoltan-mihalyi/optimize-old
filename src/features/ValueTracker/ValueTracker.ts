import {Feature} from "../../Feature";
import declarationPhase = require("./DeclarationPhase");
import updateWriteInfoPhase = require("./UpdateWriteInfoPhase");
import valueTrackingPhase = require("./ValueTrackingPhase");
import removeUnusedPhase = require("./RemoveUnusedPhase");

const feature:Feature<any> = new Feature<any>();
declarationPhase(feature);
updateWriteInfoPhase(feature);
valueTrackingPhase(feature);
removeUnusedPhase(feature);

export = feature;