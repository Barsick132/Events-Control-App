import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'

Vue.use(Vuetify)

const opts = {
    theme: {
        options: {
            customProperties: true,
        },
        themes: {
            light: {
                background: '#eeeeee'
            },
        },
    }
}

export default new Vuetify(opts)