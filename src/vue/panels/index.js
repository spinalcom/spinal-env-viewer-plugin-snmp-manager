import Vue from "vue";
import { SpinalForgeExtention } from "spinal-env-viewer-panel-manager-service_spinalforgeextention";
import { DISCOVER_SNMP_PANEL, MONITORING_PANEL_NAME } from "../../js/constants";

// Vue
import DiscoverNetworkPanel from "./discoverSnmpPanel.vue";
import monitoringPanel from "./monitoringPanel.vue";

const panels = [
    {
        name: DISCOVER_SNMP_PANEL,
        vueMountComponent: Vue.extend(DiscoverNetworkPanel),
        panel: {
            title: "Discover SNMP network",
            closeBehaviour: "destroy", // hide pour cacher le panel, [n'importe quelle autre valeur] pour detruire le panel
        },
        style: {
            minWidth: '720px',
            height: "770px",
            left: "400px",
        },
    },
    {
        name: MONITORING_PANEL_NAME,
        vueMountComponent: Vue.extend(monitoringPanel),
        panel: {
            title: "Monitor SNMP network",
            closeBehaviour: "destroy", // hide pour cacher le panel, [n'importe quelle autre valeur] pour detruire le panel
        },
        style: {
            minWidth: '720px',
            height: "770px",
            left: "400px",
        },
    },
];



for (const element of panels) {
    const panelExtension = SpinalForgeExtention.createExtention(element);
    SpinalForgeExtention.registerExtention(element.name, panelExtension);
}