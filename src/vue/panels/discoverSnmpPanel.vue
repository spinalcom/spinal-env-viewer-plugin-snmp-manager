<template>
  <div class="_panel_container">
    <md-steppers class="stepper_container" :md-active-step.sync="step" md-vertical md-linear>
      <!-- Step 1 -->
      <md-step :id="STEPS.serverInfo" md-label="Network Info" md-description="Enter the network information"
        :md-editable="false" :md-done="step > STEPS.serverInfo">

        <network-info-step :networks="networks" :loading="isLoading" @nextStep="nextStep" @addNetwork="addNetwork"
          @removeNetwork="removeNetwork" />

      </md-step>



      <!-- Step 2 -->
      <md-step :id="STEPS.discovering" md-label="Discovering" md-description="Launch the discovery" :md-editable="false"
        :md-done="step > STEPS.discovering">

        <discover-info-step :state="state" @discover="goToDiscovering" @nextStep="nextStep" @goBack="goBack"
          @cancel="cancelDiscovering" @retry="retry" :progress="discoverProgress" />

      </md-step>

      <!-- Step 3 -->
      <md-step :id="STEPS.discovered" md-label="Discovered" md-description="select the nodes to create"
        :md-editable="false" :md-done="step > STEPS.discovered">

        <select-to-create-step :state="state" :treeFields="treeFields" @nextStep="goToCreationStep"
          @goBack="goBack"></select-to-create-step>

      </md-step>

      <!-- Step 4 -->
      <md-step :id="STEPS.creation" md-label="Create Nodes" md-description="Node creation" :md-editable="false">

        <creation-info-step :state="state" @create="createNodes" @goBack="goBack"></creation-info-step>

      </md-step>
    </md-steppers>
  </div>
</template>

<script>
import { SpinalGraphService } from "spinal-env-viewer-graph-service";


import { STATES, SpinalSNMPDiscover } from "spinal-model-snmp";
import spinalExcelManager from "spinal-env-viewer-plugin-excel-manager-service";
import { NETWORK_PANEL_STEPS, DISCOVER_SNMP_PANEL } from "../../js/constants";

import NetworkInfoStep from "./step_content/networkInfo.vue"
import DiscoverInfoStep from "./step_content/discoverInfo.vue";
import SelectToCreateStep from "./step_content/selectToCreate.vue";
import CreationInfoStep from "./step_content/creationStep.vue";


export default {
  name: DISCOVER_SNMP_PANEL,
  components: {
    "network-info-step": NetworkInfoStep,
    "discover-info-step": DiscoverInfoStep,
    "select-to-create-step": SelectToCreateStep,
    "creation-info-step": CreationInfoStep,
  },
  data() {
    this.STATES = STATES;
    this.spinalDiscover;
    this.context;
    this.graph;
    this.organ;
    this.devicesBindProcess;

    this.STEPS = NETWORK_PANEL_STEPS;
    this.processBind = null;
    this.progressBindProcess = null;

    return {
      step: this.STEPS.serverInfo,
      state: this.STATES.initial,
      treeFields: [],
      entryPointTreeFields: [],
      checkedNodes: [],
      ask: false,
      isLoading: false,
      networks: [{ id: 0, name: "network 1", address: "127.0.0.1:1160", mibFile: undefined }],
      discoverProgress: {
        total: 0,
        finished: 0,
        failed: 0
      }
    };
  },
  methods: {
    async opened({ graph, context, organ, serverInfo }) {
      this.graph = graph;
      this.context = context;
      this.organ = await organ;
      if (serverInfo && serverInfo.name) this.serverInfo.name = serverInfo.name;

      this.initialized();
    },

    initialized() {
      this.spinalDiscover = undefined;
      this.state = STATES.initial;
      this.step = this.STEPS.serverInfo;
    },

    closed() {
      if (this.spinalDiscover) this.spinalDiscover.changeState(STATES.cancelled);
    },


    goToCreationStep({ checkedNodes, stepName }) {
      this.checkedNodes = checkedNodes;
      this.nextStep(stepName);
    },

    // step
    nextStep(step) {
      switch (step) {
        case this.STEPS.serverInfo:
        case this.STEPS.selectEntryPoint:
        case this.STEPS.discovering:
        case this.STEPS.discovered:
          this.step = (Number(step) + 1).toString();
          console.log("next step", this.step);
          break;
      }
    },

    goBack(step) {
      switch (step) {
        case this.STEPS.discovering:
        case this.STEPS.discovered:
        case this.STEPS.selectEntryPoint:
        case this.STEPS.creation:
          this.step = (Number(step) - 1).toString();
          break;
      }

      if (this.spinalDiscover && step !== this.STEPS.creation) {
        this.spinalDiscover.changeState(STATES.cancelled);
        this.state = STATES.initial;
      }

    },


    //step end

    // server info

    addNetwork() {
      const id = this.networks[0].id + 1;
      this.networks = [{ id, address: "", mib: undefined }, ...this.networks];
      console.log(this.networks);
    },

    removeNetwork(item) {
      const id = item.id;
      this.networks = this.networks.filter(el => el.id !== id);
    },

    // uploadGateways() {
    //   let input = document.createElement("input");
    //   input.type = "file";
    //   input.accept = ".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel";
    //   input.click();

    //   input.addEventListener("change", async (event) => {
    //     this.isLoading = true;

    //     try {
    //       const file = event.target.files[0];
    //       const ips = await this.convertFileDataToJson(file);
    //       this.serverInfo.gateways = ips.map((el, index) => {
    //         el.id = index;
    //         return el;
    //       });

    //       this.isLoading = false;
    //     } catch (error) {
    //       console.log(error);

    //       this.isLoading = false;
    //     }
    //   }, false);
    // },

    // async convertFileDataToJson(file) {
    //   const dataJson = await spinalExcelManager.convertExcelToJson(file);
    //   const ips = [];
    //   let index = 0;
    //   for (const key in dataJson) {
    //     if (Object.hasOwnProperty.call(dataJson, key)) {
    //       const values = dataJson[key];
    //       for (const item of values) {
    //         item.id = index;
    //         ips.push(item);
    //         index++;
    //       }
    //     }
    //   }
    //   return ips;
    // },

    // discover

    async createNewSpinalDiscover() {
      this.networks = this.networks.filter(el => el.address.trim().length > 0 && el.address.toString().trim().length > 0);
      console.log("networks", this.networks);
      this.spinalDiscover = new SpinalSNMPDiscover(this.graph, this.context, this.organ, this.networks);
      this.spinalDiscover.changeState(STATES.readyToDiscover);

      await this.spinalDiscover.addToGraph();
      return this.spinalDiscover;
    },

    async goToDiscovering() {
      this.state = STATES.discovering;
      await this.createNewSpinalDiscover();

      this.bindDiscoverProgress();
      this.bindDiscoverState();
      console.log("start discovering", this.spinalDiscover);
    },

    async goToDiscovered() {
      const tree = await this.spinalDiscover.getTreeDiscovered();
      console.log("discovered tree", tree);
      this.treeFields = [tree];
      this.state = STATES.discovered;
    },

    async cancelDiscovering() {
      this.state = STATES.initial;
      this.spinalDiscover.changeState(STATES.cancelled);
    },

    retry() {
      this.spinalDiscover.changeState(STATES.discovering);
      this.state = STATES.discovering;
    },

    bindDiscoverProgress() {
      ////// bind is executed on init and on progress change
      this.progressBindProcess = this.spinalDiscover.progress.bind(async () => {
        const progress = this.spinalDiscover.progress.get();
        this.discoverProgress = progress;
      }, true);
    },

    bindDiscoverState() {
      this.processBind = this.spinalDiscover.state.bind(async () => {
        const state = this.spinalDiscover.state.get();
        switch (state) {
          case STATES.discovered:
            this.goToDiscovered();
            break;

          case STATES.error:
            this.state = STATES.error;
            break;
          case STATES.cancelled:
            await this.resetSpinalDiscover();
            break;
          case STATES.created:
            this.state = STATES.created;
            await this.resetSpinalDiscover();
            break;
          // case STATES.pending:
          //   this.state = STATES.pending;
          //   this.ask = this.spinalDiscover.ask?.get() || false;
          //   break;
        }
      });
    },

    async resetSpinalDiscover() {
      if (this.spinalDiscover) {
        if (this.processBind) this.spinalDiscover.state.unbind(this.processBind);
        if (this.progressBindProcess) this.spinalDiscover.state.unbind(this.progressBindProcess);
        await this.spinalDiscover.removeFromGraph();

        this.spinalDiscover = null;
        this.processBind = null;
        this.progressBindProcess = null;
      }

    },


    ConfirmChoice(choice) {
      this.spinalDiscover.changeChoice(choice);
      this.state = STATES.discovering;
    },


    // discover end

    // creation
    async createNodes() {
      this.state = STATES.creating;
      const treeSelected = await this.getTreeSelected();
      console.log("treeSelected", treeSelected);
      await this.spinalDiscover.setTreeToCreate(treeSelected);
      this.spinalDiscover.changeState(STATES.readyToCreate);

    },

    getTreeSelected() {
      const treeCopy = JSON.parse(JSON.stringify(this.treeFields[0]));
      const itemSelected = this.convertTreeSelectedToObj();

      return this.filterTree(treeCopy, itemSelected);
    },

    convertTreeSelectedToObj() {
      return this.checkedNodes.reduce((o, id) => {
        o[id] = id;
        return o;
      }, {})
    },

    async filterTree(tree, nodeSelected) {
      if (nodeSelected[tree.oid]) return tree;

      const promises = tree.children.map((child) => this.filterTree(child, nodeSelected));

      const childrenFiltered = await Promise.all(promises).then((result) => result.filter(Boolean));

      if (childrenFiltered.length > 0) {
        const copy = Object.assign({}, tree);
        copy.children = childrenFiltered;
        return copy;
      } else {
        return null;
      }
    },

    // creation end

    formatTree(tree, parentId) {
      return tree.reduce((list, item) => {
        const hasChild =
          item.children && item.children.length > 0 ? true : false;
        const copy = {
          name: item.name,
          oid: item.oid,
          parentId,
        };
        if (hasChild)
          list.push(...this.formatTree(item.children, item.oid).flat());

        list.push(copy);
        return list;
      }, []);
    },

    convertToObj(tree, parentId, obj) {
      return tree.reduce((list, item) => {
        const hasChild =
          item.children && item.children.length > 0 ? true : false;
        const copy = {
          name: item.name,
          oid: item.oid,
          parentId,
        };
        if (hasChild)
          list.push(
            ...this.convertToObj(item.children, item.oid, obj).flat()
          );

        obj[copy.oid] = copy;
        list.push(copy);
        return list;
      }, []);
    },
  },

  async beforeDestroy() {
    await this.spinalDiscover.remove(this.graph);
  },
};
</script>


<style lang="scss">
._panel_container {
  width: 100%;
  height: 100%;

  .stepper_container {
    width: 100%;
    height: calc(100% - 60px);
    background: transparent !important;

    .form {
      width: 90%;

      .md-field {
        min-height: unset !important;
      }
    }

    .initial_state {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .discovering_state {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .discovered_state {
      .control_wrapper {
        height: 350px;
        overflow-y: auto;
      }
    }
  }
}
</style>

<style lang="scss">
._panel_container * {
  box-sizing: border-box !important;
}

._panel_container {
  .stepper_container {
    .md-steppers-wrapper {
      width: 100%;
      height: 100%;

      .md-steppers-container {
        width: 100%;
        height: 100%;

        .md-stepper-content.md-active {
          width: calc(100% - 60px);
          min-height: 390px;
        }
      }
    }
  }
}
</style>


<style>
._panel_container .md-stepper-content {
  padding-right: 0px !important;
  padding-bottom: 0px !important;
}
</style>