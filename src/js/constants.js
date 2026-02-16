
export const SIDEBAR = "GraphManagerSideBar";

////// Panels
export const DISCOVER_SNMP_PANEL = "discoverSNMPNetworkPanel";
export const MONITORING_PANEL_NAME = "opcuaMonitoringPanel";

////// Dialogs
export const CREATE_SUBNETWORK_DIALOG_IN_SNMP = "createSubNetworkDialogInSnmp";
export const LINK_PROFILE_TO_DEVICE_DIALOG = "LinkProfileToSNMPDeviceDialog";
export const GENERATE_PROFILE_DIALOG = "generateSNMPProfileDialog";
export const CONFIG_PROFILE_DIALOG = "configSNMPProfileDialog";


export const NETWORK_PANEL_STEPS = Object.freeze({
    serverInfo: "1",
    // selectEntryPoint: "2",
    discovering: "2",
    discovered: "3",
    creation: "4",
});