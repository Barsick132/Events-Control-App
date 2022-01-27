<template>
  <div>
    <v-card height="500" :disabled="loading" :loading="loading">
      <!-- App Bar -->
      <v-app-bar flat color="transparent">
        <!-- Title -->
        <v-toolbar-title>
          <h1 class="text-h6">{{ event.title }}</h1>
          <div class="d-inline-flex">
            <div class="text-subtitle-2 mr-4">
              {{ event.from | getHumanDate }}
            </div>
            <div class="text-subtitle-2 mr-4">
              <v-icon v-if="event.category" :color="event.category.color" small
                >mdi-circle</v-icon
              >
              {{ event.from | getHumanTime }} - {{ event.till | getHumanTime }}
              <v-icon class="px-1" color="black" small
                >mdi-clock-outline</v-icon
              >
            </div>
          </div>
        </v-toolbar-title>

        <v-spacer></v-spacer>

        <!-- Menu Button -->
        <v-menu offset-y>
          <template v-slot:activator="{ on, attrs }">
            <v-btn v-bind="attrs" v-on="on" icon>
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item
              :to="{ name: 'events.content.update', params: { event } }"
              link
            >
              <v-list-item-title>Update</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-app-bar>
      <!-- END App Bar -->

      <v-divider />

      <!-- Participants -->
      <v-card-text class="d-inline-flex">
        <div
          v-for="participant in event.participants"
          :key="participant.id"
          class="d-inline-flex align-center mr-8"
        >
          <!-- Avatar -->
          <v-avatar color="secondary">
            <img
              v-if="participant.avatar"
              :src="participant.avatar"
              :alt="participant.login"
            />
            <span v-else class="white--text text-h5">{{
              participant.initials
            }}</span>
          </v-avatar>
          <div class="ml-2">
            <div class="text-subtitle-2 black--text">
              {{ participant.shortName }}
            </div>
            <div v-if="participant.owner" class="text-caption black--text">
              Owner
            </div>
          </div>
        </div>
      </v-card-text>
      <!-- END Participants -->

      <v-divider />
      <!-- Description -->
      <v-card-text>
        <p class="text-pre-wrap">{{ event.description }}</p>
      </v-card-text>
      <!-- END Description -->
    </v-card>

    <!-- Update Content Modal -->
    <router-view />
  </div>
</template>

<script>
import EventsService from "@/services/events.service";
import { getHumanDate, getHumanTime } from "@/filters";

export default {
  props: ["id"],

  /**
   * Обновление контента при переходе с модального окна
   */
  beforeRouteUpdate(to, from, next) {
    if (to.name === "events.content") this.getEvent();
    next();
  },

  watch: {
    id: {
      immediate: true,
      handler(value) {
        this.getEvent();
      },
    },
  },

  data() {
    return {
      event: {},
      errors: [],
      loading: false,
    };
  },

  filters: {
    getHumanDate,
    getHumanTime,
  },

  methods: {
    getEvent() {
      // Запрашиваем данные по id
      this.errors = [];
      this.loading = true;

      EventsService.getEventById(this.id)
        .then((res) => {
          this.event = res;
        })
        .catch((err) => {
          this.errors = err;
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>
