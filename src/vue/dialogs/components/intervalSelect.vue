<template>
    <md-field v-if="!isMenu">
        <label for="interval">{{ label }}</label>
        <md-select name="interval" id="interval" @input="selectItem" v-model="selected">
            <md-option v-for="i in intervals" :key="i.id" :value="i.value">{{ i.name }}</md-option>
        </md-select>
    </md-field>

    <md-menu md-size="big" v-else>
        <md-button class="md-primary md-dense" md-menu-trigger>
            {{ label }}
            <md-icon>expand_more</md-icon>
        </md-button>

        <md-menu-content>
            <md-menu-item v-for="i in intervals" :key="i.id" @click="() => selectItem(i.value)">
                {{ i.name }}
            </md-menu-item>
        </md-menu-content>
    </md-menu>

</template>


<script>
export default {
    name: "IntervalSelect",
    props: ['label', 'intervals', 'value', 'type'],
    data() {
        return {
            selected: this.value
        }
    },
    mounted() {
        this.selected = this.value;
    },
    watch: {
        value(newVal) {
            console.log("newVal", newVal); // Debugging line
            this.selected = newVal;
        }
    },
    methods: {
        selectItem(value) {
            this.$emit("select", value);
        }
    },
    computed: {
        isMenu() {
            return this.type === "menu";
        }
    }
}
</script>

<style scoped></style>