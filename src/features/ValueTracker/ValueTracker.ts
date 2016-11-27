import {Feature} from "../../Feature";
import Scope = require("../../Scope");
import AstNode = require("../../AstNode");
import Variable = require("./Variable");
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