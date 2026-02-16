import { SpinalContextApp, spinalContextMenuService } from "spinal-env-viewer-context-menu-service";
import { SpinalGraphService } from "spinal-env-viewer-graph-service";
const { spinalPanelManagerService } = require("spinal-env-viewer-panel-manager-service");
import { SNMP_ORGAN_TYPE } from "spinal-model-snmp";
import { CREATE_SUBNETWORK_DIALOG_IN_SNMP } from "../js/constants"
const SIDEBAR = "GraphManagerSideBar";


class CreateSubNetworkBtn extends SpinalContextApp {
    constructor() {
        super(
            "Create BMS subnetwork",
            "This button allows to create new sub network", {
            icon: "add",
            icon_type: "in",
            backgroundColor: "#FF0000",
            fontColor: "#FFFFFF"
        });
    }

    async isShown(option) {
        const typeSelected = option.selectedNode.type.get();

        const result = typeSelected === SNMP_ORGAN_TYPE ? true : -1;

        return Promise.resolve(result);
    }


    action(option) {
        spinalPanelManagerService.openPanel(CREATE_SUBNETWORK_DIALOG_IN_SNMP, option)
    }

}

const createSubNetworkBtn = new CreateSubNetworkBtn()

spinalContextMenuService.registerApp(SIDEBAR, createSubNetworkBtn, [3]);

export default createSubNetworkBtn;