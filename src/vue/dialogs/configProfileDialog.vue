<template>
    <md-dialog class="configContainer" :md-active.sync="showDialog" @md-closed="closeDialog(false)">
        <md-dialog-title class="title">
            Configure SNMP profile
        </md-dialog-title>

        <md-dialog-content class="dialogContent">

            <div v-if="state === STATES.loaded" class="loadedContent">
                <table-component :data="endpointsFormatted" :intervals="intervalsList"></table-component>
            </div>

            <div class="loading" v-else>
                <md-progress-spinner md-mode="indeterminate" v-if="state === STATES.loading"></md-progress-spinner>
                <md-icon class="md-size-5x" v-if="state === STATES.success">check</md-icon>
                <md-icon class="md-size-5x" v-if="state === STATES.error">close</md-icon>
            </div>

        </md-dialog-content>


        <md-dialog-actions>

            <md-button class="md-accent" @click="closeDialog(false)">Close</md-button>
            <md-button class="md-primary" @click="Save" :disabled="state !== STATES.loaded">Save</md-button>
        </md-dialog-actions>
    </md-dialog>
</template>


<script>

import { CONFIG_PROFILE_DIALOG } from "../../js/constants";
import SnmpProfileService from "../../js/snmpProfileService";
import TableComponent from "./components/table.vue";

import lodash from "lodash";

export default {
    name: CONFIG_PROFILE_DIALOG,
    props: ["onFinised"],
    components: {
        "table-component": TableComponent
    },
    data() {
        this.STATES = {
            loading: 1,
            loaded: 2,
            success: 3,
            error: 4
        };

        this.endpointsObjects = {};

        return {
            showDialog: true,
            state: this.STATES.loading,
            context: null,
            selectedNode: null,
            endpoints: [],
            endpointsFormatted: [],
            intervalsList: []
        }
    },
    methods: {
        async opened({ graph, context, selectedNode, organ }) {
            try {
                this.context = context;
                this.selectedNode = selectedNode;
                // this.organ = organ;
                this.state = this.STATES.loading;
                const [endpoints, intervals] = await this.initializate(selectedNode);

                this.endpoints = endpoints;
                this.intervalsList = intervals;

                this.endpointsFormatted = await this._formatEndpoints(endpoints);

                this.state = this.STATES.loaded;
            } catch (error) {
                console.error("Error initializing SNMP profile configuration dialog:", error);
                this.state = this.STATES.error;
            }

        },

        initializate(node) {
            const instance = SnmpProfileService.getInstance();
            const promises = [instance.getItems(node), instance.getIntervals(node)];

            return Promise.all(promises).then(([endpoints, intervals]) => {
                if (intervals.length === 0) intervals = this._getDefaultIntervals();
                else intervals = this._formatIntervals(intervals);

                return [endpoints, intervals];
            })
        },

        _formatIntervals(intervals) {
            let hasNoMonitored = false;
            let hasCov = false;

            const intervalsFound = intervals.map(({ node }) => {
                if (node.info.value.get() === -1) hasNoMonitored = true;
                if (node.info.value.get() === 0) hasCov = true;

                return {
                    id: node.getId().get(),
                    name: node.getName().get(),
                    value: node.info.value.get()
                }
            });

            // If there is no "Not Monitored" option, add it to the beginning of the list
            if (!hasNoMonitored) intervalsFound.unshift({ id: -1, name: "Not Monitored", value: -1 });
            if (!hasCov) intervalsFound.unshift({ id: 0, name: "COV", value: 0 });


            return intervalsFound;
        },

        _getDefaultIntervals() {
            return [
                { id: -1, name: "Not Monitored", value: -1 },
                { id: 0, name: "COV", value: 0 },
                { id: 5000, name: "5 seconds", value: 5000 },
                { id: 30000, name: "30 seconds", value: 30000 },
                { id: 60000, name: "1 minute", value: 60000 },
                { id: 300000, name: "5 minutes", value: 300000 },
                { id: 1800000, name: "30 minutes", value: 1800000 },
                { id: 3600000, name: "1 hour", value: 3600000 },
            ]
        },

        _formatEndpoints(endpoints) {
            const promises = endpoints.map(async endpoint => {
                const key = endpoint.info.idNetwork.get();
                this.endpointsObjects[key] = endpoint; // Store the original endpoint object for later reference
                const { interval, saveTimeSeries } = await this._getIntervalAndSaveTimeSeriesForEndpoint(endpoint);

                return {
                    id: endpoint.info.id.get(),
                    name: endpoint.info.name.get(),
                    oid: endpoint.info.idNetwork.get(),
                    saveTimeSeries,
                    interval
                    // interval: this.intervalsList.find(interval => interval.id === endpoint.intervalId)?.name || "N/A"
                }
            });

            return Promise.all(promises);
        },

        async _getIntervalAndSaveTimeSeriesForEndpoint(originalEndpoint) {
            const saveTimeSeries = (originalEndpoint.info.saveTimeSeries && originalEndpoint.info.saveTimeSeries.get()) || false;
            const intervalNode = await SnmpProfileService.getInstance().getActualIntervalForItem(originalEndpoint);

            const interval = intervalNode ? intervalNode.info.value.get() : -1;

            return {
                saveTimeSeries,
                interval: interval ?? -1
            }
        },

        Save() {
            this.state = this.STATES.loading;
            const instance = SnmpProfileService.getInstance();

            const classifiedByInterval = lodash.groupBy(this.endpointsFormatted, "interval");


            const intervals = Object.keys(classifiedByInterval);

            // For each interval, get the corresponding endpoints and add them to the profile
            const promises = intervals.map(interval => {
                const intervalInfo = this.intervalsList.find(i => i.value == parseInt(interval));

                const endpoints = classifiedByInterval[interval];
                const endpointsNodes = this._getEndpointsNodesNodes(endpoints);

                return instance.addIntervalToProfile(this.selectedNode, intervalInfo, endpointsNodes);
            });

            // Wait for all intervals to be added before showing success or error state
            return Promise.all(promises).then(() => {
                this.state = this.STATES.success;
                // setTimeout(() => {
                //     this.closeDialog(true);
                // }, 1000);
            }).catch((err) => {
                console.error("Error saving SNMP profile configuration:", err);
                this.state = this.STATES.error;
            })
        },

        // This function retrieves the original endpoint nodes based on the displayed endpoints and updates their saveTimeSeries properties
        _getEndpointsNodesNodes(endpoints) {
            const endpointsNodes = [];

            for (const endpoint of endpoints) {
                const endpointNode = this.endpointsObjects[endpoint.oid];
                if (endpointNode) {
                    // Update saveTimeSeries and interval properties on the original endpoint node
                    this._setSaveTimeSeries(endpointNode, endpoint.saveTimeSeries);
                    endpointsNodes.push(endpointNode);
                }
            }

            return endpointsNodes;
        },

        _setSaveTimeSeries(endpoint, save) {
            console.log("_setSaveTimeSeries", endpoint, save);
            if (endpoint.info.saveTimeSeries) {
                endpoint.info.saveTimeSeries.set(save);
                return;
            }

            endpoint.info.add_attr({ saveTimeSeries: save });
        },

        removed(option) {
            if (option.closeResult) {
            }
            this.showDialog = false;
        },

        closeDialog(closeResult) {
            if (typeof this.onFinised === "function") {
                this.onFinised({ closeResult });
            }
        },
    }
}
</script>

<style scoped lang="scss">
.configContainer {
    width: 100%;
    height: 100%;
}

.configContainer .title {
    font-size: 24px;
    font-weight: bold;
    text-align: center;
}

.configContainer .dialogContent {
    width: 100%;
    height: 100%;
}

.configContainer .loading {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>