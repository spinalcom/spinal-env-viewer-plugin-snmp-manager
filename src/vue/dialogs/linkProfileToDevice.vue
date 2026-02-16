<template>
    <md-dialog class="linkContainer" :md-active.sync="showDialog" @md-closed="closeDialog(false)">
        <md-dialog-title class="title">
            Select Profile
        </md-dialog-title>

        <md-dialog-content>

            <div v-if="state === STATES.loaded" class="loadedContent">
                <md-list v-if="profiles.length > 0">
                    <md-list-item v-for="profile of profiles" :key="profile.id" @click="() => selectProfile(profile.id)"
                        :class="{ selected: profile.id === profileSelected }">
                        {{ profile.name }}
                    </md-list-item>

                </md-list>

                <div v-else class="loading">
                    <h3>No Profile Found</h3>
                </div>

            </div>

            <div class="loading" v-else>
                <md-progress-spinner md-mode="indeterminate" v-if="state === STATES.loading"></md-progress-spinner>
                <md-icon class="md-size-5x" v-if="state === STATES.success">check</md-icon>
                <md-icon class="md-size-5x" v-if="state === STATES.error">close</md-icon>
            </div>
        </md-dialog-content>

        <md-dialog-actions>
            <md-button class="md-primary" @click="closeDialog(false)">Close</md-button>
            <md-button class="md-primary" @click="Link"
                :disabled="!profileSelected || state !== STATES.loaded">Link</md-button>
        </md-dialog-actions>
    </md-dialog>
</template>

<script>
import { LINK_PROFILE_TO_DEVICE_DIALOG } from "../../js/constants";
import { SnmpProfileService } from '../../js/snmpProfileService';

export default {
    name: LINK_PROFILE_TO_DEVICE_DIALOG,
    props: ["onFinised"],
    components: {},
    data() {

        this.STATES = {
            loading: 1,
            loaded: 2,
            success: 3,
            error: 4
        };

        return {
            state: this.STATES.loading,
            showDialog: true,
            context: null,
            selectedNode: null,
            profileSelected: null,
            nodes: {},
            profiles: []
        };
    },
    methods: {
        async opened({ graph, context, selectedNode, organ }) {
            this.state = this.STATES.loading;
            this.context = context;
            this.selectedNode = selectedNode;

            this.profiles = await this.getAllProfiles();

            this.state = this.STATES.loaded;
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

        async getAllProfiles() {
            const profiles = await SnmpProfileService.getInstance().getProfiles();
            const res = [];

            for (const profile of profiles) {
                this.nodes[profile.getId().get()] = profile;
                res.push(profile.info.get());
            }

            return res;
        },

        selectProfile(id) {
            this.profileSelected = id;
        },


        async Link() {
            try {
                const profileNode = this.nodes[this.profileSelected];
                if (!profileNode) return;

                this.state = this.STATES.loading;
                await SnmpProfileService.getInstance().linkProfileToDevice(this.selectedNode, profileNode);
                this.state = this.STATES.success;
            } catch (error) {
                this.state = this.STATES.error;
            }

        },

    },
};
</script>

<style lang="scss">
.linkContainer {
    width: 600px;
    height: 600px;

    .title {
        text-align: center;
    }

    .loadedContent {
        width: calc(100% - 20px);
        height: calc(100% - 20px);
        margin: 10px;
        border: 1px solid grey;
        border-radius: 15px;

        .selected {
            background: blue;
        }
    }

    .loading {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }


}
</style>