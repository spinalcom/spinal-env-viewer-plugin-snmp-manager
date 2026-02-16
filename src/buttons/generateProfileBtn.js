import { SpinalContextApp, spinalContextMenuService } from "spinal-env-viewer-context-menu-service";
import { SpinalGraphService } from "spinal-env-viewer-graph-service";
const { spinalPanelManagerService } = require("spinal-env-viewer-panel-manager-service");
import { SNMP_ORGAN_TYPE } from "spinal-model-snmp";


import { GENERATE_PROFILE_DIALOG, SIDEBAR } from "../js/constants";
import utilities from "../js/utilities";
import { SpinalBmsDevice } from "spinal-model-bmsnetwork";


class GenerateProfile extends SpinalContextApp {
    constructor() {
        super("Generate SNMP Profile", "This button allows to Generate snmp monitoring Profile", {
            icon: "transform",
            icon_type: "in",
            backgroundColor: "#FF0000",
            fontColor: "#FFFFFF"
        });
    }

    async isShown(option) {
        const typeSelected = option.selectedNode.type.get();
        const id = option.selectedNode.id.get();
        const contextId = option.context.id.get();
        if (typeSelected !== SpinalBmsDevice.nodeTypeName) return -1;

        const organNode = await utilities.getOrgan(id, contextId);

        const organ = organNode && await organNode.getElement(true);

        return organ && organ.type.get() == SNMP_ORGAN_TYPE ? true : -1;

        // return -1;
    }

    async action(option) {
        const nodeId = option.selectedNode.id.get();
        const contextId = option.context.id.get();

        const param = {
            graph: option.graph,
            context: SpinalGraphService.getRealNode(contextId),
            selectedNode: SpinalGraphService.getRealNode(nodeId),
        }

        spinalPanelManagerService.openPanel(GENERATE_PROFILE_DIALOG, param);
    }
}



const generateProfile = new GenerateProfile()

spinalContextMenuService.registerApp(SIDEBAR, generateProfile, [3]);

export default generateProfile;