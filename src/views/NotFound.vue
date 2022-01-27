<template>
  <v-main>
    <v-layout class="d-flex align-center justify-center" fill-height>
      <v-flex class="mx-auto col-sm-8 col-md-6 col-lg-5 col-xl-4 pa-1">
        <!-- <v-img
            width="300"
            :src="$root.images.OriginalLogo"
            class="mx-auto mb-2"
        ></v-img> -->
        <v-card>
          <v-card-title>
            404 Страница не найдена :(
          </v-card-title>
          <v-card-text>
              Страница, которую вы ищете не существует. Вы можете перейти на другие страницы, представленные
            ниже.
          </v-card-text>
          <v-card-actions class="pt-0 d-flex justify-center">
            <v-btn color="primary" x-small titlecase to="/">Вернуться на главную</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-main>
</template>

<script>
export default {
  name: 'NotFound.vue'
}
</script>