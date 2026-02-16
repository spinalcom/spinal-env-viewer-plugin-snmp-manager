<template>
    <div class="step_content">
        <!-- Initial state -->
        <div class="initial_state" v-if="state === STATES.initial">
            <md-button class="md-raised md-primary" @click="goToDiscovering"> Discover </md-button>
            <md-button class="md-raised md-accent" @click="goBack"> Back </md-button>
        </div>

        <!-- Discovering state -->
        <div class="discovering_state" v-else-if="state === STATES.discovering">
            <md-progress-bar style="width: 100%" md-mode="determinate" :md-value="percent"></md-progress-bar>
            <!-- <div class="md-layout md-gutter progress_info">
                <div class="md-layout-item md-alignment-center">Gateway discovered : {{ progress.finished }}</div>
                <div class="md-layout-item md-alignment-center">Gateway failed : {{ progress.failed }}</div>
            </div> -->
            <md-button class="md-raised md-accent" @click="cancelDiscovering"> Cancel </md-button>
        </div>

        <!-- Error state -->
        <div v-else-if="state === STATES.error">
            <div class="error_content">
                <div>Something went wrong, please</div>
                <md-button class="md-primary" flat @click="retry">try again</md-button>
                <div>or</div>
                <md-button class="md-accent" flat @click="goBack">go back</md-button>
            </div>
        </div>
    </div>
</template>

<script>
import { STATES } from "spinal-model-snmp"
import { NETWORK_PANEL_STEPS } from "../../../js/constants"
// import { TreeViewComponent } from "@syncfusion/ej2-vue-navigations";

export default {
    name: "DiscoverInfo",
    // components: {
    //     "ejs-treeview": TreeViewComponent,
    // },
    props: {
        state: {
            type: String,
            required: true,
        },
        progress: {
            type: Object,
            required: false,
            default: () => ({ total: 0, finished: 0, failed: 0 }),
        },
    },
    data() {
        this.STATES = STATES;

        return {
            stepName: NETWORK_PANEL_STEPS.discovering,
            checkedNodes: []
        }
    },
    methods: {
        goToDiscovering() {
            this.$emit("discover");
        },

        nextStep() {
            this.$emit("nextStep", this.stepName);
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
    },
    watch: {
        state(newVal) {
            if (newVal === STATES.discovered) {
                this.nextStep();
            }
        }
    },
    computed: {
        percent() {
            return this.progress.total === 0 ? 0 : ((this.progress.finished + this.progress.failed) / this.progress.total) * 100;
        }
    }
}
</script>

<style scoped></style>