<template>
  <v-dialog
    v-model="dialog"
    max-width="700px"
    scrollable
    @click:outside="closeModal"
  >
    <!-- Слот активатора модального окна -->
    <template v-slot:activator="{ on, attrs }">
      <slot name="activator" v-bind="{ on, attrs }"></slot>
    </template>

    <v-card :disabled="loading" :loading="loading">
      <!-- Верхний toolbar -->
      <v-card-title class="text-h6">
        Create Event
        <v-spacer />
        <v-btn @click="closeModal" icon>
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <!-- Вывод ошибок -->
      <v-card-text v-if="errors.length">
        <ul class="red--text font-weight-bold">
          <li v-for="(error, key) in errors" :key="key">
            {{ error.message }}
          </li>
        </ul>
      </v-card-text>

      <!-- Форма для отправки -->
      <EventEditor :key="dialog" @submit="submit">
        <template  v-slot:toolbar>
          <v-spacer></v-spacer>
          <v-btn type="submit" color="primary">Create</v-btn>
        </template>
      </EventEditor>
    </v-card>
  </v-dialog>
</template>

<script>
import EventsService from "@/services/events.service";
import EventEditor from "@/views/Events/EventEditor.vue";

export default {
   components: {
    EventEditor,
  },

  data() {
    return {
      dialog: false,
      errors: [],
      loading: false,
    };
  },

 

  methods: {
    /**
     * Запрос создания события
     */
    submit(newEvent) {
      if (this.loading) return;

      this.errors = [];
      this.loading = true;

      EventsService.createEvent(newEvent)
        .then((event) => {
          this.closeModal();
          this.$router.push({
            name: "events.content",
            params: { id: event.id },
          });
        })
        .catch((err) => {
          this.errors = err;
        })
        .finally(() => {
          this.loading = false;
        });
    },

    /**
     * Закрываем модальное окно и очищаем форму
     */
    closeModal() {
      this.dialog = false;
      this.$refs.editor.reset();
    },
  },
};
</script>
