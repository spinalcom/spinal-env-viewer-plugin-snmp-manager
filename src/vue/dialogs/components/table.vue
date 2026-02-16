<template>
    <div>
        <!-- <md-table v-model="dataFiltered" md-sort="name" md-sort-order="asc" md-card md-fixed-header> -->
        <md-table class="myTable">

            <md-table-toolbar class="tableToolbar">
                <!-- <div class="firstBar">
                    <div class="">
                        <md-button class="md-accent md-raised" @click="() => saveTimeSeriesForItems(false)">
                            unsaveTimeSeries for items displayed
                        </md-button>

                        <md-button class="md-primary md-raised" @click="() => saveTimeSeriesForItems(true)">
                            SaveTimeSeries for items displayed
                        </md-button>
                    </div>


                    <div class="toolbarMdfield">
                        <interval-select :intervals="intervals" label="Set items displayed Intervals"
                            @select="changeIntervalForItems"></interval-select>
                    </div>
                </div> -->

                <div class="secondBar">

                    <!-- Champs de Recherche -->
                    <md-field md-clearable class="toolbarMdfield">
                        <md-icon>search</md-icon>
                        <md-input class="search" placeholder="Search by name..." v-model="search"
                            @input="searchOnTable" />
                    </md-field>
                </div>

            </md-table-toolbar>


            <md-table-row>
                <md-table-head md-label="OID" md-sort-by="oid">OID</md-table-head>
                <md-table-head md-label="Name" md-sort-by="name">Name</md-table-head>

                <md-table-head>
                    <interval-select :intervals="intervals" type="menu" label="Set items displayed Intervals"
                        @select="changeIntervalForItems"></interval-select>
                </md-table-head>

                <md-table-head>

                    <md-button class="md-icon-button md-dense md-primary" title="SaveTimeSeries for items displayed"
                        @click="() => saveTimeSeriesForItems(true)">
                        <md-icon>check_box</md-icon>
                    </md-button>

                    <md-button class="md-icon-button md-dense md-accent" title="unsaveTimeSeries for items displayed"
                        @click="() => saveTimeSeriesForItems(false)">
                        <md-icon>check_box_outline_blank</md-icon>
                    </md-button>

                </md-table-head>
            </md-table-row>


            <!-- <md-table-row slot="md-table-row" slot-scope="{ item }"> -->
            <md-table-row v-for="item in dataFiltered" :key="item.oid">

                <md-table-cell md-label="OID" md-sort-by="oid">{{ item.oid }}</md-table-cell>
                <md-table-cell md-label="Name" md-sort-by="name">{{ item.name }}</md-table-cell>

                <md-table-cell md-label="Interval">

                    <interval-select :intervals="intervals" :value="item.interval"
                        @select="value => item.interval = value"></interval-select>
                </md-table-cell>

                <md-table-cell md-label="Save TimeSeries">
                    <md-checkbox v-model="item.saveTimeSeries" class="md-primary"></md-checkbox>
                </md-table-cell>
            </md-table-row>
        </md-table>
    </div>
</template>
<script>

import intervalSelect from './intervalSelect.vue';

export default {
    name: "Table",
    props: ['data', "intervals"],
    components: {
        "interval-select": intervalSelect
    },
    data() {
        return {
            dataFiltered: [],
            search: ""
        }
    },
    mounted() {
        this.dataFiltered = this.data;
    },
    methods: {
        searchOnTable() {

            const temp_list = [];

            // use a for loop to keep reference of the original data;
            for (const item of this.data) {
                if (item.name.toLowerCase().includes(this.search.toLowerCase())) {
                    temp_list.push(item);

                    const copy = Object.assign({}, item);
                    copy.oid = "Copy of " + copy.oid;
                    temp_list.push(copy);
                }
            }
            this.dataFiltered = temp_list;

            // Commented to use a for loop to keep reference of the original data;
            // this.dataFiltered = this.data.filter(item => item.name.toLowerCase().includes(this.search.toLowerCase()));
        },

        saveTimeSeriesForItems(save) {
            console.log("saveTimeSeriesForItems", save, this.dataFiltered);
            for (const item of this.dataFiltered) {
                item.saveTimeSeries = save;
            }
        },

        changeIntervalForItems(value) {
            for (const item of this.dataFiltered) {
                item.interval = value;
            }
        }
    },
    watch: {
        data: {
            handler() {
                this.dataFiltered = this.data;
            },
            immediate: true
        }
    }
}
</script>
<style lang="scss" scoped>
.tableToolbar {
    display: flex;
    flex-direction: column;
}

.firstBar {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.secondBar {
    justify-content: flex-end;
    display: flex;
    width: 100%;
}

.toolbarMdfield {
    width: calc(50% - 20px);
}
</style>

<style>
.myTable .md-table-row th:last-child,
.myTable .md-table-row td:last-child {
    text-align: center;
}
</style>