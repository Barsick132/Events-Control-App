<template>
  <v-main>
    <v-container>
      <!-- Заголовок -->
      <v-row>
        <v-col>
          <h1 class="display-1">Events</h1>
        </v-col>
      </v-row>

      <!-- Вывод ошибок -->
      <v-row v-if="errors.length">
        <v-col>
          <v-alert dense outlined type="error">
            <ul>
              <li v-for="(error, key) in errors" :key="key">
                {{ error.message }}
              </li>
            </ul>
          </v-alert>
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <!-- Элементы управления-->
          <v-sheet color="transparent">
            <v-container fluid>
              <v-row class="align-center">
                <v-col cols="2" class="pa-0">
                  <!-- Поле поиска -->
                  <v-text-field
                    v-model="params.filters.search"
                    label="Search"
                    placeholder="Enter a phrase to search..."
                    hide-details="auto"
                    prepend-inner-icon="mdi-magnify"
                    solo
                    clearable
                  />
                </v-col>
                <v-col cols="3" class="pa-0 ml-4">
                  <!-- Компонент выбора диапазона дат -->
                  <DateRangePicker
                    v-model="params.filters.range"
                    label="Range"
                    placeholder="Select range"
                  ></DateRangePicker>
                </v-col>
                <v-spacer />
                <!-- Модальное окно -->
                <EventsContentCreate>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn color="primary" v-bind="attrs" v-on="on"
                      >Create</v-btn
                    >
                  </template>
                </EventsContentCreate>
              </v-row>
            </v-container>
          </v-sheet>
        </v-col>
      </v-row>
      <v-row>
        <!-- Список событий -->
        <v-col cols="3">
          <v-card :disabled="loading" :loading="loading">
            <v-responsive
              ref="scrollbar"
              class="overflow-y-auto"
              height="500"
              @scroll="scroll"
            >
              <v-card-text>
                <v-list subheader>
                  <template v-for="(eventsDay, key) in groupingEvents">
                    <v-subheader :key="`header_${key}`">{{
                      eventsDay[0].from | getHumanDate
                    }}</v-subheader>

                    <template v-for="event in eventsDay">
                      <!-- TODO: three-line можно в будущем менять в зависимости от ширины экрана -->
                      <v-list-item
                        :key="event.id"
                        :to="{
                          name: 'events.content',
                          params: { id: event.id },
                        }"
                        color="primary"
                        :three-line="event.title.length > 45"
                        link
                      >
                        <v-list-item-content>
                          <v-list-item-title>
                            <div class="d-inline-flex">
                              <div class="text-subtitle-2 mr-4">
                                <v-icon :color="event.category.color" small
                                  >mdi-circle</v-icon
                                >
                                {{ event.from | getHumanTime }} -
                                {{ event.till | getHumanTime }}
                                <v-icon class="px-1" color="black" small
                                  >mdi-clock-outline</v-icon
                                >
                              </div>
                            </div>
                          </v-list-item-title>

                          <v-list-item-subtitle>{{
                            event.title
                          }}</v-list-item-subtitle>
                        </v-list-item-content>
                      </v-list-item>
                    </template>
                  </template>

                  <p v-if="!Object.keys(events).length">Events not found :(</p>
                </v-list>
              </v-card-text>
            </v-responsive>
          </v-card>
        </v-col>
        <v-col cols="9">
          <!-- Контент -->
          <router-view />
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script>
import EventsService from "@/services/events.service";
import EventsContentCreate from "@/views/Events/EventsContentCreate.vue";
import DateRangePicker from "@/components/DateRangePicker.vue";
import moment from "moment";
import { getHumanDate, getHumanTime } from "@/filters";

class Direction {
  constructor() {
    this.setForward();
  }

  setForward(offset = 0) {
    this.forward = { offset };
    delete this.backward;
    return this;
  }

  setBackward(offset = 0) {
    delete this.forward;
    this.backward = { offset };
    return this;
  }
}

/* 
direction: {
  date: '',
  offset: 0
}
 */

export default {
  watch: {
    "params.filters": {
      deep: true,
      handler: function (value) {
        this.resetParams();
      },
    },
    params: {
      deep: true,
      immediate: true,
      handler: function (value) {
        this.getEvents();
      },
    },
  },

  data: function () {
    return {
      events: {},

      errors: [],
      loading: false,

      params: {
        filters: {
          search: "",
          range: {
            from: "",
            till: "",
          },
        },
        count: 10,
        target: null,
        direction: new Direction(),
      },

      oldScroll: {
        height: 0,
        top: 0,
      },
    };
  },

  components: {
    EventsContentCreate,
    DateRangePicker,
  },

  filters: {
    getHumanDate,
    getHumanTime,
  },

  computed: {
    /**
     * ID выбранного события
     */
    id() {
      return this.$route.params.id;
    },

    /**
     * Группированный список событий
     */
    groupingEvents() {
      if (!Array.isArray(this.events)) return [];
      // Преобразуем содержимое объектов
      let events = {};

      // Группируем элементы по дате
      this.events.forEach((event) => {
        const from = moment(event.from).format("YYYY-MM-DD");

        if (!events[from]) {
          events[from] = [];
        }

        events[from].push(event);
      });

      return Object.values(events);
    },

    /**
     * Первый элемент группированного списка событий
     */
    getFirstGroup() {
      if (!this.groupingEvents.length) return null;
      return this.groupingEvents[0];
    },

    /**
     * Первый элемент группированного списка событий
     */
    getLastGroup() {
      if (!this.groupingEvents.length) return null;
      return this.groupingEvents[this.groupingEvents.length - 1];
    },
  },

  methods: {
    /**
     *
     * Запрос списка событий
     *
     */
    getEvents() {
      // TODO: Можно потом попробовать перезапрашивать список, если данного элемента в нем нет

      if (this.loading) return;

      // Очищаем ошибки и запускаем loader
      this.errors = [];
      this.loading = true;

      EventsService.getEvents(this.params)
        .then((res) => {
          if (!this.events.length) {
            this.events = res;

            // Сдвигаем scrollTop на 1, чтобы оставить возможность
            // скрола вверх
            this.$nextTick(() => {
              this.$refs.scrollbar.$el.scrollTop = 1;
            });

            this.selectDefaultEvent();
          } else if (this.params.direction.forward) {
            // Добавляем события в конец списка
            this.events = this.events.concat(res);
          } else if (this.params.direction.backward) {
            // Добавляем события в начало списка
            this.events = res.concat(this.events);

            this.scrollToTarget();
          }
        })
        .catch((err) => {
          this.errors = err;
        })
        .finally(() => {
          this.loading = false;
        });
    },

    /**
     *
     * Переходим к первому событию в списке, если id не указан
     *
     */
    selectDefaultEvent() {
      if (!this.id) {
        this.$router.push({
          name: "events.content",
          params: { id: this.events[0].id },
        });
      }
    },

    /**
     *
     *  Сбрасываем список, target дату и направление перед перезапросом списка
     *
     */
    resetParams() {
      this.events = {};

      this.params.target = this.params.filters.range.from ?? null;

      this.params.direction.setForward();
    },

    /**
     *
     *  Сдвиг скрола к исходной позиции,
     *  при скроле вверх
     *
     */
    scrollToTarget() {
      this.$nextTick(() => {
        const el = this.$refs.scrollbar.$el;

        // Если элементы добавились в начало
        if (
          el.scrollHeight !== this.oldScroll.height &&
          this.oldScroll.height &&
          !this.oldScroll.top
        ) {
          // Смещаем скрол к старой пизиции
          el.scrollTop = el.scrollHeight - this.oldScroll.height;
        }
      });
    },

    /**
     *
     * Обновление позиции скрола и
     * обновление данных направление при достижении начала или конца списка
     *
     */
    scroll(e) {
      // Отслеживаем позицию скрола
      this.oldScroll.height = e.target.scrollHeight;
      this.oldScroll.top = e.target.scrollTop;

      if (!Array.isArray(this.events) || !this.events.length) return;

      // Если мы вверху или внизу скрола
      if (
        this.oldScroll.height - this.oldScroll.top === e.target.clientHeight ||
        !this.oldScroll.top
      ) {
        let group = null;

        // Меняем направление target дату
        if (this.oldScroll.top) {
          // Если вврху
          group = this.getLastGroup;
          this.params.direction.setForward(group.length);
        } else {
          // если внизу
          group = this.getFirstGroup;
          this.params.direction.setBackward(group.length);
        }

        this.params.target = moment(group[0].from).format("YYYY-MM-DD");
      }
    },
  },
};
</script>
