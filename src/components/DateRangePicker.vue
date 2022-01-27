<template>
  <div>
    <v-menu
      v-model="menu"
      :close-on-content-click="false"
      :nudge-right="40"
      transition="scale-transition"
      offset-y
      min-width="auto"
      @input="showMenu"
    >
      <template v-slot:activator="{ on, attrs }">
        <v-text-field
          v-model="dateRangeText"
          :label="label"
          :placeholder="placeholder"
          prepend-inner-icon="mdi-calendar"
          append-icon="mdi-close"
          readonly
          v-bind="attrs"
          v-on="on"
          hide-details="auto"
          :error="!valid"
          solo
          @click:append="clear"
        ></v-text-field>
      </template>

      <v-card>
        <v-date-picker
          v-if="before"
          v-model="computedFrom"
          scrollable
        ></v-date-picker>

        <v-slide-x-transition>
          <v-date-picker
            v-if="!before"
            v-model="computedTill"
            scrollable
          ></v-date-picker>
        </v-slide-x-transition>

        <v-container fluid>
          <v-row class="align-center">
            <v-col>
              <v-btn v-if="!before" @click="togglePicker" text
                >Prev</v-btn
              ></v-col
            >
            <v-col>
              <strong>Date {{ before ? "from" : "till" }}</strong>
            </v-col>
            <v-col>
              <v-btn v-if="before" @click="togglePicker" text>Next</v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-menu>
  </div>
</template>

<script>
import moment from "moment";

export default {
  model: {
    prop: "range",
    event: "change",
  },

  props: ["label", "placeholder", "range"],

  watch: {
    range: {
      deep: true,
      immediate: true,
      handler(value) {
        this.computedFrom = value.from;
        this.computedTill = value.till;
      },
    },
  },

  data() {
    return {
      valid: true,
      before: true,
      menu: false,
      from: null,
      till: null,
    };
  },

  computed: {
    /**
     * computed свойство для текстового вывода периода
     */
    dateRangeText() {
      this.valid = true;

      
      if (this.from && this.till && this.till.diff(this.from) < 0) {
        this.valid = false;
        return "Incorrect range";
      }

      let rangeText = "All times";

      if (this.from || this.till)
        rangeText = `${
          this.from ? this.from.format("MM/DD/YYYY") : "infinity"
        } - ${this.till ? this.till.format("MM/DD/YYYY") : "infinity"}`;

      return rangeText;
    },

    computedFrom: {
      set(value) {
        this.from = !value ? null : moment(value);
      },
      get() {
        if (!this.from) return "";
        return this.from.format("YYYY-MM-DD");
      },
    },

    computedTill: {
      set(value) {
        this.till = !value ? null : moment(value);
      },
      get() {
        if (!this.till) return "";
        return this.till.format("YYYY-MM-DD");
      },
    },
  },

  methods: {
    /**
     * Toggle Date Pickers
     */
    togglePicker() {
      this.before = !this.before;
    },

    /**
     * Обратный вызов при закрытии меню
     */
    showMenu(event) {
      if (!event && this.valid) {
        this.change();
      }
    },

    /**
     * Очистка полей
     */
    clear() {
      this.computedFrom = "";
      this.computedTill = "";

      this.change();
    },

    /**
     * Обратный вызов с передачей range
     */
    change() {
      this.$emit("change", {
        from: this.computedFrom,
        till: this.computedTill,
      });
    },
  },
};
</script>