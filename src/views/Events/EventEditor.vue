<template>
  <v-form ref="form" @submit.prevent="submit">
    <v-card-text>
      <v-container fluid>
        <v-row>
          <!-- Поле заголовка -->
          <v-col cols="12"
            ><v-text-field
              v-model="newEvent.title"
              label="Title"
              placeholder="Title"
              :rules="ruleTitle"
              hide-details="auto"
              dense
              outlined
            ></v-text-field
          ></v-col>
        </v-row>
        <v-row>
          <v-col cols="4">
            <!-- Поле даты -->
            <v-menu
              v-model="dateMenu"
              :close-on-content-click="false"
              :nudge-right="40"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="newEvent.date"
                  label="Date"
                  :rules="ruleDate"
                  append-icon="mdi-calendar"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="newEvent.date"
                @input="dateMenu = false"
              ></v-date-picker>
            </v-menu>
          </v-col>
          <v-col cols="4">
            <!-- Поле времени начала -->
            <v-menu
              v-model="timeFromMenu"
              :close-on-content-click="false"
              :nudge-right="40"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="newEvent.timeFrom"
                  label="Time from"
                  :rules="ruleTimeFrom"
                  append-icon="mdi-calendar"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-time-picker
                v-model="newEvent.timeFrom"
                scrollable
                @input="timeFromMenu = false"
              ></v-time-picker>
            </v-menu>
          </v-col>
          <v-col cols="4">
            <!-- Поле времени окончания -->
            <v-menu
              v-model="timeTillMenu"
              :close-on-content-click="false"
              :nudge-right="40"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="newEvent.timeTill"
                  label="Time till"
                  :rules="ruleTimeTill"
                  append-icon="mdi-calendar"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-time-picker
                v-model="newEvent.timeTill"
                scrollable
                @input="timeTillMenu = false"
              ></v-time-picker>
            </v-menu>
          </v-col>
        </v-row>
        <v-row>
          <v-col class="pt-0" cols="6">
            <!-- Указатель повтора события -->
            <v-checkbox
              v-model="repeat"
              label="Repeat"
              hide-details="auto"
              dense
            ></v-checkbox>
          </v-col>
          <v-col v-if="repeat" class="pt-0" cols="6">
            <!-- Поле выбора количества повторений -->
            <v-select
              v-model="newEvent.repeatValue"
              label="Repeat"
              placeholder="Repeat"
              :items="repeatList"
              :rules="ruleRepeatValue"
              hide-details="auto"
              dense
              outlined
            ></v-select>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="6">
            <!-- Поле выбора категории -->
            <v-select
              v-model="newEvent.category"
              :items="categories"
              :loading="loadingCategories"
              item-text="name"
              item-value="id"
              label="Category"
              placeholder="Category"
              :rules="ruleCategory"
              hide-details="auto"
              :error-messages="computedErrorsCategories"
              error-count="2"
              dense
              outlined
              return-object
            ></v-select>
          </v-col>
          <v-col cols="6">
            <!-- Поле выбора участников -->
            <v-autocomplete
              v-model="newEvent.selectedParticipants"
              label="Participants"
              placeholder="Find users..."
              :items="computedParticipants"
              :loading="loadingParticipants"
              :search-input.sync="searchParticipants"
              :rules="ruleParticipants"
              :error-messages="computedErrorsParticipants"
              error-count="2"
              hide-details="auto"
              hide-no-data
              hide-selected
              item-text="shortName"
              item-value="id"
              append-icon="mdi-magnify"
              dense
              outlined
              clearable
              multiple
              small-chips
              return-object
            ></v-autocomplete
          ></v-col>
        </v-row>
        <v-row>
          <v-col>
            <!-- Поле описания -->
            <v-textarea
              v-model="newEvent.description"
              label="Description"
              placeholder="Description"
              :rules="ruleDescription"
              hide-details="auto"
              dense
              outlined
            ></v-textarea
          ></v-col>
        </v-row>
      </v-container>
    </v-card-text>

    <v-divider></v-divider>

    <!-- Нижний toolbar -->
    <v-card-actions>
      <slot name="toolbar" v-bind="{ submit }"></slot>
    </v-card-actions>
  </v-form>
</template>

<script>
import EventsService from "@/services/events.service";
import moment from "moment";

export default {
  name: "EventEditor",

  props: ["event"],

  created() {
    if (this.categories.length) return;
    // Categories have already been requested
    if (this.loadingCategories) return;

    this.loadingCategories = true;
    // Запрашиваем категории
    EventsService.getCategories()
      .then((res) => {
        this.categories = res;
      })
      .catch((err) => {
        this.errorsCategories = err;
      })
      .finally(() => {
        this.loadingCategories = false;
      });
  },

  watch: {
    event: {
      deep: true,
      immediate: true,
      handler(value) {
        // Если это форма для обновления,
        // устанавливаем исходные данные события
        if (value) {
          const from = moment(value.from);
          const till = moment(value.till);

          this.repeat = !!value.repeat;

          this.newEvent = {
            id: value.id,
            title: value.title,
            date: from.format("YYYY-MM-DD"),
            timeFrom: from.format("HH:mm"),
            timeTill: till.format("HH:mm"),
            repeatValue: value.repeat,
            category: value.category,
            selectedParticipants: value.participants,
            description: value.description,
          };
        }
      },
    },

    /**
     * Запрашиваем список пользователей
     */
    searchParticipants: {
      immediate: true,
      handler(name) {
        if (this.participants.length) return;
        // Participants have already been requested
        if (this.loadingParticipants) return;

        this.loadingParticipants = true;

        // Lazily load input items
        EventsService.getEmployees()
          .then((res) => {
            this.participants = res;
          })
          .catch((err) => {
            this.errorsParticipants = err;
          })
          .finally(() => (this.loadingParticipants = false));
      },
    },
  },

 
  data() {
    return {
      // Событие
      newEvent: {
        title: "",
        date: "",
        timeFrom: "",
        timeTill: "",
        repeatValue: "",
        category: null,
        selectedParticipants: null,
        description: "",
      },

      // Вспомогательные данные
      dateMenu: false,
      timeFromMenu: false,
      timeTillMenu: false,
      repeat: false,
      categories: [],
      loadingCategories: false,
      errorsCategories: [],
      repeatList: ["day", "week", "month", "year"],
      participants: [],
      searchParticipants: null,
      loadingParticipants: false,
      errorsParticipants: [],


      // Валидаторы
      ruleTitle: [(v) => !!v || "Required"],
      ruleDate: [(v) => !!v || "Required"],
      ruleTimeFrom: [
        (v) => !!v || "Required",
        (v) => this.validateTimes(v, this.newEvent.timeTill),
      ],
      ruleTimeTill: [
        (v) => !!v || "Required",
        (v) => this.validateTimes(this.newEvent.timeFrom, v),
      ],
      ruleRepeatValue: [
        (v) => {
          if (this.repeat) return !!v || "Required";
          else return true;
        },
      ],
      ruleCategory: [(v) => !!v || "Required"],
      ruleParticipants: [(v) => !!(v && v.length) || "Required"],
      ruleDescription: [(v) => !!v || "Required"],
    };
  },

  computed: {

    
    /**
     * Список с короткими именами
     */
    computedParticipants() {
      return this.participants.map((participant) => {
        participant.shortName = `${participant.name} ${participant.surname
          .charAt(0)
          .toUpperCase()}.`;
        return participant;
      });
    },
    /**
     * 
     */
    computedErrorsCategories() {
      return this.errorsCategories.map(error => error.message)
    },
    computedErrorsParticipants() {
      return this.errorsParticipants.map(error => error.message)
    }
  },

  methods: {
    /**
     * Общий метод валидации для времени
     */
    validateTimes(timeFrom, timeTill) {
      if (!timeTill || !timeFrom) return true;

      return (
        moment(timeTill, "HH:mm").diff(moment(timeFrom, "HH:mm")) >= 0 ||
        "Time from should be less than time till"
      );
    },

    /**
     * Валидируем и пересобираем данные перед отправкой
     */
    submit() {
      if (this.$refs.form.validate()) {
        const eventFormated = {
          title: this.newEvent.title,
          from: moment(
            `${this.newEvent.date} ${this.newEvent.timeFrom}`,
            "YYYY-MM-DD HH:mm"
          ).format(),
          till: moment(
            `${this.newEvent.date} ${this.newEvent.timeTill}`,
            "YYYY-MM-DD HH:mm"
          ).format(),
          repeat: this.newEvent.repeatValue,
          category: this.newEvent.category.id,
          participants: this.newEvent.selectedParticipants.map(
            (participant) => participant.id
          ),
          description: this.newEvent.description,
        };

        if (this.newEvent.id) eventFormated.id = this.newEvent.id;

        this.$emit("submit", eventFormated);
      }
    },

    /**
     * Сброс данных формы
     */
    reset() {
      this.$refs.form.reset();
    },
  },
};
</script>
