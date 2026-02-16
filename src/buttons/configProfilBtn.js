import { SpinalContextApp, spinalContextMenuService } from "spinal-env-viewer-context-menu-service";
import { SpinalGraphService } from "spinal-env-viewer-graph-service";
const { spinalPanelManagerService } = require("spinal-env-viewer-panel-manager-service");
import { CONFIG_PROFILE_DIALOG, SIDEBAR } from "../js/constants";
import { PROFILE_TYPE } from "../js/snmpProfileService";


class ConfigProfilBtn extends SpinalContextApp {
    constructor() {
        super("Configure SNMP monitoring Profile", "This button allows to configure snmp network monitoring profile", {
            icon: "timer",
            icon_type: "in",
            backgroundColor: "#FF0000",
            fontColor: "#FFFFFF"
        });
    }

    async isShown(option) {
        const typeSelected = option.selectedNode.type.get();

        return typeSelected === PROFILE_TYPE ? true : -1;
    }

    async action(option) {
        const id = option.selectedNode.id.get();
        const contextId = option.context.id.get();


        const param = {
            graph: option.graph,
            context: SpinalGraphService.getRealNode(contextId),
            selectedNode: SpinalGraphService.getRealNode(id),
        }

        spinalPanelManagerService.openPanel(CONFIG_PROFILE_DIALOG, param);
    }
}



const configProfilBtn = new ConfigProfilBtn()

spinalContextMenuService.registerApp(SIDEBAR, configProfilBtn, [3]);

export default configProfilBtn;