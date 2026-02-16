<template>
    <div class="step_content">

        <div class="discovered_state" v-if="state === STATES.discovered">
            <div class="control_wrapper">
                <v-treeview dark selectable open-on-click hoverable transition item-text="name" item-key="oid"
                    selected-color="primary" v-model="checkedNodes" :items="treeFields">
                </v-treeview>
            </div>

            <div>
                <md-button class="md-raised md-primary" @click="nextStep"
                    :disabled="checkedNodes.length === 0">Next</md-button>
                <md-button class="md-raised md-accent" @click="goBack"> Cancel and Back</md-button>
            </div>
        </div>

    </div>
</template>

<script>

import { STATES } from "spinal-model-snmp";
import { TreeViewComponent } from "@syncfusion/ej2-vue-navigations";
import { NETWORK_PANEL_STEPS } from "../../../js/constants";


export default {
    name: "DiscoverStep",
    components: {
        "ejs-treeview": TreeViewComponent,
    },
    props: {
        state: { required: true },
        treeFields: { required: true }
    },
    data() {
        this.STATES = STATES;
        // this.CHOICES = OPCUA_ORGAN_USER_CHOICE;
        this.stepName = NETWORK_PANEL_STEPS.discovered;

        return {
            checkedNodes: []
        }
    },

    methods: {

        goToDiscovering() {
            this.$emit("discover");
        },

        nextStep() {
            this.$emit("nextStep", { stepName: this.stepName, checkedNodes: this.checkedNodes });
        },

        goBack() {
            this.$emit("goBack", this.stepName);
        },

        cancelDiscovering() {
            this.$emit("cancel");
        },

        retry() {
            this.$emit("retry");
        },

        askResult(useResult) {
            this.$emit("askResult", useResult);
        }
    },
    // computed: {
    //     percent() {
    //         return this.progress.total === 0 ? 0 : ((this.progress.finished + this.progress.failed) / this.progress.total) * 100;
    //     }
    // }
}
</script>

<style scoped>
.error_content {
    display: flex;
    align-items: center;
}

.progress_info {
    width: 100% !important;
    margin: 10px;
}
</style>