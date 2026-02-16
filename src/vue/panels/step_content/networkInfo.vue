<template>
    <div class="step_content">
        <div class="form">
            <div class="content" v-if="!loading">
                <div class="header">
                    <md-button class="md-dense md-primary" @click="addNetwork">
                        add Network
                    </md-button>
                </div>

                <div class="networks_container">
                    <div class="network_list" v-for="(item, index) in networks" :key="index">
                        <div class="name">
                            <md-field md-inline>
                                <label>name</label>
                                <md-input v-model="item.name"></md-input>
                            </md-field>
                        </div>

                        <div class="address">
                            <md-field md-inline>
                                <label>address (ip:port)</label>
                                <md-input v-model="item.address"></md-input>
                            </md-field>
                        </div>

                        <div class="uploadMib">
                            <md-field>
                                <label>Upload MIB file</label>
                                <md-file @change="uploadMib($event, item)" />
                            </md-field>
                        </div>

                        <div class="action" v-if="item.id > 0">
                            <md-button class="md-icon-button md-accent" @click="removeNetwork(item)">
                                <md-icon>remove</md-icon>
                            </md-button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Loading -->
            <div class="loading" v-else-if="loading">
                <md-progress-spinner md-mode="indeterminate"></md-progress-spinner>
            </div>


        </div>

        <md-button class="md-raised md-primary" @click="nextStep" :disabled="disabled" v-if="!loading">
            Next
        </md-button>
    </div>
</template>

<script>

import { NETWORK_PANEL_STEPS } from "../../../js/constants";

export default {
    name: "NetworkInfo",
    props: { networks: Array, loading: Boolean },
    data() {
        return {
            stepName: NETWORK_PANEL_STEPS.serverInfo,
        }
    },
    methods: {
        nextStep() {
            this.$emit("nextStep", this.stepName);
        },

        // upload() {
        //     this.$emit("upload");
        // },
        addNetwork() {
            this.$emit("addNetwork");
        },

        removeNetwork(item) {
            this.$emit("removeNetwork", item);
        },

        uploadMib(event, item) {
            console.log(event, item);
            const file = event.target.files[0];
            if (file) item.mibFile = file;
        },
    },
    computed: {
        disabled() {
            return this.networks.length === 0;
        },
    }
}
</script>

<style scoped>
.loading {
    width: 100%;
    height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.content {
    width: 100%;
    height: 400px;
}

.content .header {
    width: 100%;
    height: 50px;
    margin: 15px 0;
    display: flex;
}

.content .networks_container {
    width: 100%;
    height: 340px;
    padding: 5px 0;
    overflow: hidden;
    overflow-y: auto;
}

.content .networks_container .network_list {
    width: 100%;
    height: 50px;
    display: flex;
    align-items: center;
}

.content .networks_container .network_list .name,
.content .networks_container .network_list .address,
.content .networks_container .network_list .uploadMib {
    width: calc(33% - 20px);
    margin: 3px;
}

.content .networks_container .network_list .action {
    width: 50px;
}
</style>

<style>
.md-field.md-has-file .md-input {
    text-overflow: ellipsis;
    width: 20px;
}
</style>