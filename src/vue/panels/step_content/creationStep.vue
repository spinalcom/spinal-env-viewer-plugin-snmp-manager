<template>
    <div class="step_content" v-if="state === STATES.creating">
        <md-progress-spinner md-mode="indeterminate"></md-progress-spinner>
    </div>

    <div class="step_content" v-else-if="state === STATES.created">
        Created !
    </div>

    <div class="step_content" v-else>
        <md-button class="md-raised md-primary" @click="createNodes">Create nodes</md-button>
        <md-button class="md-raised md-accent" @click="goBack">Back</md-button>
    </div>
</template>

<script>
import { STATES } from "spinal-model-snmp";
import { NETWORK_PANEL_STEPS } from "../../../js/constants"

export default {
    name: "CreateStep",
    props: {
        state: { required: true },
    },
    data() {
        this.STATES = STATES;
        this.stepName = NETWORK_PANEL_STEPS.discovered;

        return {}
    },
    methods: {
        createNodes() {
            this.$emit("create");
        },

        goBack() {
            this.$emit("goBack", this.stepName);
        },
    }
}
</script>

<style></style>