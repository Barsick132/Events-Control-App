<template>
  <v-dialog
    v-model="dialog"
    max-width="700px"
    scrollable
    @click:outside="closeModal"
  >
    <v-card :disabled="loading" :loading="loading">
      <!-- Верхний toolbar -->
      <v-card-title class="text-h6">
        Update Event
        <v-spacer />
        <v-btn @click="closeModal" icon>
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <!-- Вывод ошибок -->
      <v-card-text v-if="errors.length" class="pb-0 pt-4">
        <ul class="red--text font-weight-bold">
          <li v-for="(error, key) in errors" :key="key">
            {{ error.message }}
          </li>
        </ul>
      </v-card-text>

      <!-- Форма для отправки -->
      <EventEditor :event="event" @submit="submit">
        <template v-slot:toolbar>
          <v-spacer></v-spacer>
          <v-btn type="submit" color="primary">Update</v-btn>
        </template>
      </EventEditor>
    </v-card>
  </v-dialog>
</template>

<script>
import EventsService from "@/services/events.service";
import EventEditor from "@/views/Events/EventEditor.vue";

export default {
  props: ["id", "event"],

  /**
   * Запрещаем переход по прямой ссылке к модальному окну
   */
  beforeRouteEnter(to, from, next) {
    if (to.params.event) next();
    else next({ name: "events.content", params: { id: to.params.id } });
  },

  data() {
    return {
      dialog: true,
      errors: [],
      loading: false,
    };
  },

  components: {
    EventEditor,
  },

  methods: {
    /**
     * Запрос обновления события
     */
    submit(newEvent) {
      if (this.loading) return;

      this.errors = [];
      this.loading = true;

      EventsService.updateEvent(newEvent)
        .then((res) => {
          this.closeModal();
        })
        .catch((err) => {
          this.errors = err;
        })
        .finally(() => {
          this.loading = false;
        });
    },

    /**
     * Закрываем модальное окно
     */
    closeModal() {
      this.$router.push({ name: "events.content", params: { id: this.id } });
    },
  },
};
</script>
