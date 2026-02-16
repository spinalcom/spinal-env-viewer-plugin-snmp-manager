<template>
    <div class="_panel_container">
        <div class="header">
            <md-button class="md-icon-button md-primary" @click="startAll" title="start all">
                <md-icon>play_arrow</md-icon>
            </md-button>

            <md-button class="md-icon-button md-accent" @click="stopAll" title="stop all">
                <md-icon>stop</md-icon>
            </md-button>

            <md-button class="md-icon-button md-primary" @click="restartAll" title="restart all">
                <md-icon>refresh</md-icon>
            </md-button>

            <!-- <md-button class="md-primary" @click="() => changeAllTimeSeries(true)">Save all time series </md-button>

            <md-button class="md-accent" @click="() => changeAllTimeSeries(false)">Stop saving all time
                series</md-button> -->

        </div>

        <md-list class="listDiv md-double-line">
            <md-list-item v-for="device in devices" :key="device.id">
                <div class="md-list-item-text">
                    <span>{{ device.name }}</span>
                    <span :class="`${getState(device.id)} subtypes`">{{ getState(device.id) }}</span>
                </div>


                <div class="md-list-action">
                    <md-button class="md-icon-button md-primary" :disabled="disableBtn(Button_names.start, device.id)"
                        @click="() => start(device.id)" title="start">
                        <md-icon>play_arrow</md-icon>
                    </md-button>

                    <md-button class="md-icon-button md-accent" :disabled="disableBtn(Button_names.stop, device.id)"
                        @click="() => stop(device.id)" title="stop">
                        <md-icon>stop</md-icon>
                    </md-button>

                    <md-button class="md-icon-button md-primary" :disabled="disableBtn(Button_names.restart, device.id)"
                        @click="() => restart(device.id)" title="restart">
                        <md-icon>refresh</md-icon>
                    </md-button>


                    <!-- <div class="block">
                        <div class="input">
                            <md-checkbox class="primary" :disabled="disableBtn(Button_names.checkbox, device.id)"
                                :value="!getTimeSeriesValue(device.id)"
                                @change="() => setTimeSeriesValue(device.id)">Save
                                timeseries</md-checkbox>
                        </div>
                    </div>-->

                </div>

            </md-list-item>

        </md-list>
    </div>
</template>

<script>
import { MONITORING_PANEL_NAME } from "../../js/constants";
import { SpinalSNMPListener } from "spinal-model-snmp";
import { SpinalBmsDevice, SpinalBmsNetwork } from 'spinal-model-bmsnetwork';
import { SPINAL_RELATION_PTR_LST_TYPE } from "spinal-model-graph";
import { SnmpProfileService, CONTEXT_TO_PROFILE_RELATION } from '../../js/snmpProfileService';
import * as lodash from "lodash"

const snmpProfileService = new SnmpProfileService();

export default {
    name: MONITORING_PANEL_NAME,
    data() {

        this.context;
        this.graph;
        this.organ;
        this.network;

        this.STATES = {
            loading: 1,
            loaded: 2,
            error: 3
        }

        this.Button_names = {
            start: 1,
            stop: 2,
            restart: 3,
            checkbox: 4
        }

        this.STEPS = Object.freeze({
            serverInfo: "1",
            discovering: "2",
            creation: "3",
        });

        this.nodes = {};
        this.listeners = {};
        this.updateInterface = lodash.debounce(() => this.$forceUpdate(), 100);

        return {
            state: this.STATES.loading,
            step: this.STEPS.serverInfo,
            devices: []
        };
    },

    methods: {
        async opened(params) {
            this.graph = params.graph;
            this.context = params.context;
            this.organ = params.organ;
            this.network = params.network;
            this.devices = await this.getDevices(params.selectedNode);
        },

        closed() { },

        async start(deviceId, globalUpdate) {
            const listener = this.listeners[deviceId];
            if (listener) {
                listener.monitored.set(true);
                if (!globalUpdate) this.updateInterface()
                return;
            }

            const node = this.nodes[deviceId];
            const profile = await snmpProfileService.getProfileLinked(node);

            if (!profile) return;

            let model = new SpinalSNMPListener(this.graph, this.context, this.organ, this.network, node, profile, true);
            await model.addToGraph();

            this.listeners[deviceId] = model;
            if (!globalUpdate) this.updateInterface()
        },

        stop(deviceId, globalUpdate) {
            const listener = this.listeners[deviceId];

            if (listener) {
                if (!globalUpdate) this.updateInterface()
                listener.monitored.set(false);
            }

        },

        restart(deviceId, globalUpdate) {
            return new Promise(async (resolve) => {
                await this.stop(deviceId, globalUpdate);

                setTimeout(async () => {
                    await this.start(deviceId, globalUpdate);
                    resolve(true);
                }, 1000);
            });

        },

        async getDevices(selectedNode) {
            const type = selectedNode.getType().get();
            let devices = [];

            if (type === SpinalBmsNetwork.nodeTypeName) devices = await selectedNode.getChildren(SpinalBmsDevice.relationName);
            else if (type === SpinalBmsDevice.nodeTypeName) devices = [selectedNode];

            const promises = devices.map(async device => {
                const id = device.getId().get();
                this.nodes[id] = device;
                const listener = await this.getListnerModel(device);
                if (listener) this.listeners[id] = listener;
                return device.info.get();
            })

            return Promise.all(promises);

        },

        disableBtn(button, nodeId) {
            const node = this.nodes[nodeId];
            if (!node || !node.hasRelation(CONTEXT_TO_PROFILE_RELATION, SPINAL_RELATION_PTR_LST_TYPE)) return true;

            const listener = this.listeners[nodeId];

            switch (button) {
                case this.Button_names.checkbox:
                    return !listener ? true : false;

                case this.Button_names.start:
                    if (listener && listener.monitored && listener.monitored.get()) return true;
                    return false;

                case this.Button_names.stop:
                    if (!listener || !listener.monitored || !listener.monitored.get()) return true;
                    return false;

                case this.Button_names.restart:
                    if (listener && listener.monitored && listener.monitored.get()) return false;
                    return true;
            }
        },

        getListnerModel(device) {
            if (device.info.listener) {
                return new Promise((resolve, reject) => {
                    try {
                        device.info.listener.load((data) => resolve(data));
                    } catch (error) {
                        reject(error);
                    }
                });
            }
        },

        getState(nodeId) {
            const node = this.nodes[nodeId];

            if (!node || !node.hasRelation(CONTEXT_TO_PROFILE_RELATION, SPINAL_RELATION_PTR_LST_TYPE)) return "No_profile Linked";

            const listener = this.listeners[nodeId];

            return listener && listener.monitored && listener.monitored.get() ? "Monitored" : "Stopped";
        },

        async startAll() {
            const globalUpdate = true;

            for (const device of this.devices) {
                await this.start(device.id, globalUpdate);
                this.updateInterface()
            }

        },

        stopAll() {
            const globalUpdate = true;

            for (const device of this.devices) {
                this.stop(device.id, globalUpdate);
            }

            this.updateInterface()
        },

        async restartAll() {
            const globalUpdate = true;

            for (const device of this.devices) {
                await this.restart(device.id, globalUpdate);
                this.updateInterface()
            }
        },

        changeAllTimeSeries(value) {

            for (const device of this.devices) {
                const listener = this.listeners[device.id];

                if (listener && listener.saveTimeSeries) {
                    listener.saveTimeSeries.set(value);
                }
            }

            this.updateInterface();

        },

        getTimeSeriesValue(deviceId) {
            console.log("getting value")
            const listener = this.listeners[deviceId];
            if (!listener) return false;

            return listener.saveTimeSeries && listener.saveTimeSeries.get() || false;
        },

        setTimeSeriesValue(deviceId) {
            const listener = this.listeners[deviceId];

            if (listener && listener.saveTimeSeries) {
                const value = !listener.saveTimeSeries.get()
                listener.saveTimeSeries.set(value);
            }

            this.updateInterface();

        }

    },

};
</script>

<style>
/* @import url("https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900|Material+Icons");*/
</style>

<style scoped lang="scss">
._panel_container {
    width: 100%;
    height: calc(100% - 15px);

    .header {
        width: 99%;
        height: 50px;
        border: 1px solid grey;
        margin: auto;
    }

    .listDiv {
        width: 100%;
        height: calc(100% - 50px);
        background: transparent;

        .subtypes {
            font-size: 0.8em;
            font-weight: bold;
        }

        .Monitored {
            color: green !important;
        }

        .Stopped {
            color: red !important;
        }
    }

    .header {
        display: flex;
        justify-content: flex-end;
        align-items: center;
    }


}
</style>

<style>
._panel_container * {
    box-sizing: border-box !important;
}

._panel_container .md-list-action {
    display: contents;
}
</style>