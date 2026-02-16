
import Vue from "vue";
const { SpinalMountExtention } = require("spinal-env-viewer-panel-manager-service");
import { CREATE_SUBNETWORK_DIALOG_IN_SNMP, GENERATE_PROFILE_DIALOG, LINK_PROFILE_TO_DEVICE_DIALOG, CONFIG_PROFILE_DIALOG } from "../../js/constants";


////// components
import CreateSubNetworkDialogInSnmp from "./createSubNetwork.vue";
import GenerateSNMPProfileDialog from "./generateProfile.vue";
import LinkDeviceToProfile from "./linkProfileToDevice.vue";
import ConfigProfileDialog from "./configProfileDialog.vue";


const dialogs = [
    {
        name: CREATE_SUBNETWORK_DIALOG_IN_SNMP,
        vueMountComponent: Vue.extend(CreateSubNetworkDialogInSnmp),
        parentContainer: document.body
    },
    {
        name: GENERATE_PROFILE_DIALOG,
        vueMountComponent: Vue.extend(GenerateSNMPProfileDialog),
        parentContainer: document.body
    },
    {
        name: LINK_PROFILE_TO_DEVICE_DIALOG,
        vueMountComponent: Vue.extend(LinkDeviceToProfile),
        parentContainer: document.body
    },
    {
        name: CONFIG_PROFILE_DIALOG,
        vueMountComponent: Vue.extend(ConfigProfileDialog),
        parentContainer: document.body
    }
]


for (let index = 0; index < dialogs.length; index++) {
    SpinalMountExtention.mount(dialogs[index]);
}