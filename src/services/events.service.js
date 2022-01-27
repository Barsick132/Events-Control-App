import moment from "moment"
import axios from "axios"

axios.defaults.baseURL = "http://localhost:3000"

class EventsServiceRequest {
  static errors = {
    status: 200,
    data: {
      errors: [
        {
          message: 'Some error'
        },
        {
          message: 'Some error 2'
        }
      ]
    }
  }

  static Request(response) {
    return new Promise((resolve) => {

      setTimeout(() => {
        resolve(response)
      }, 500)

    })
  }

  static getEmployeesRequest({ name }) {
    return new Promise((resolve, reject) => {
      axios.get('employees')
        .then(res => {
          res.data = {
            payload: res.data
          }

          setTimeout(() => resolve(res), 500)
        })
        .catch(err => reject(err))
    })
  }


  static getCategoriesRequest() {
    return new Promise((resolve, reject) => {
      axios.get('categories')
        .then(res => {
          res.data = {
            payload: res.data
          }

          setTimeout(() => resolve(res), 500)
        })
        .catch(err => reject(err))
    })
  }


  static getEventsRequest({ search, range, count, target, direction }) {
    return new Promise((resolve, reject) => {
      Promise.all([
        this.getCategoriesRequest(),
        axios.get('events')
      ])
        .then(([categories, events]) => {
          categories = categories.data.payload

          // Сортируем по дате и времени
          events.data = events.data.sort((a, b) => {
            return moment(a.from).unix() > moment(b.from).unix() ? 1 : -1
          })

          // Фильтруем по диапазону дат
          if (range.from || range.till) {
            const from = range.from ? moment(range.from).startOf('day').unix() : -Infinity
            const till = range.till ? moment(range.till).startOf('day').unix() : Infinity

            events.data = events.data.filter(event => {
              const date = moment(event.from).startOf('day').unix()
              return from <= date && date <= till
            })
          }

          // Фильтруем по ключевым словам
          if (search) {
            events.data = events.data.filter(event => {
              const re = new RegExp(`${search}`, 'i')
              return re.test(event.title) || re.test(event.category.name)
            })
          }

          // Фильтруем по target date
          let targetUnix = moment().startOf('day').unix()
          if (target) {
            targetUnix = moment(target).startOf('day').unix()
          }
          else if (events.data.length && (range.from || range.till || search)) {
            targetUnix = moment(events.data[0].from).startOf('day').unix()
          }

          events.data = events.data.filter(event => {
            const date = moment(event.from).startOf('day').unix()

            return direction.forward ? date >= targetUnix : date <= targetUnix;
          })

          // Берем только первые count элементов в зависимости от direction
          let start = 0
          let end = events.data.length
          if (direction.forward) {
            start = 0 + direction.forward.offset;
            end = count + direction.forward.offset
            if (start > events.data.length) start = events.data.length
            if (end > events.data.length) end = events.data.length
          }
          else {
            start = events.data.length - count - direction.backward.offset;
            end = events.data.length - direction.backward.offset
            if (start < 0) start = 0
            if (end < 0) end = 0
          }
          events.data = events.data.slice(start, end)

          // Преобразуем данные
          events.data = events.data.map(event => {
            return {
              id: event.id,
              title: event.title,
              from: event.from,
              till: event.till,
              category: categories.find(item => item.id === event.category),
            };
          })

          // Преобразуем к стндартному ответу
          events.data = {
            payload: events.data
          }

          resolve(events)
        })
        .catch(err => reject(err))
    })
  }

  static getEventByIdRequest({ id }) {

    return new Promise((resolve, reject) => {
      Promise.all([
        this.getCategoriesRequest(),
        this.getEmployeesRequest({}),
        axios.get(`events/${id}`)
      ])
        .then(([categories, employees, event]) => {
          categories = categories.data.payload
          employees = employees.data.payload

          const author = event.data.participants[0]
          event.data.participants.splice(0, 1)

          event.data.participants = event.data.participants.map(id => {
            return employees.find(employee => employee.id === id)
          })

          event.data.author = employees.find(employee => employee.id === author)
          event.data.category = categories.find(item => item.id === event.data.category)

          event.data = { payload: event.data }

          setTimeout(() => resolve(event), 1000)
        })
        .catch(err => reject(err))
    })
  }

  static createEventRequest(event) {
    return new Promise((resolve, reject) => {
      axios.post('events', event)
        .then(res => {
          res.data = {
            payload: res.data
          }

          setTimeout(() => resolve(res), 1000)
        })
        .catch(err => reject(err))
    })
  }

  static updateEventRequest(event) {
    return new Promise((resolve, reject) => {
      axios.patch(`events/${event.id}`, event)
        .then(res => {
          res.data = {
            payload: res.data
          }

          setTimeout(() => resolve(res), 1000)
        })
        .catch(err => reject(err))
    })
  }
}

class EventsService {
  // Иммитатор запроса получения сотрудников
  static getEmployees(name) {
    return new Promise((resolve, reject) => {
      EventsServiceRequest.getEmployeesRequest({ name })
        .then(res => {
          if (res.data.payload)
            resolve(res.data.payload)
          else
            throw res.data

        })
        .catch(err => {
          this.showErrors(err, reject)
        })
    })
  }

  // Иммитатор запроса получения категорий
  static getCategories() {
    return new Promise((resolve, reject) => {
      EventsServiceRequest.getCategoriesRequest()
        .then(res => {
          if (res.data.payload)
            resolve(res.data.payload)
          else
            throw res.data
        })
        .catch(err => {
          this.showErrors(err, reject)
        })
    })
  }

  // Иммитатор запроса получения событий
  static getEvents(params) {
    let body = Object.assign({ ...params }, { ...params.filters });
    delete body.filters;

    return new Promise((resolve, reject) => {
      EventsServiceRequest.getEventsRequest(body)
        .then((res) => {
          // TODO: можно отдельно реализовать метод преобразования данных
          if (res.data.payload) {
            resolve(res.data.payload)
          } else
            throw res.data
        })
        .catch((err) => {
          this.showErrors(err, reject)
        })
    });
  }


  // Иммитатор запроса получения сведений о событии по id
  static getEventById(id) {
    return new Promise((resolve, reject) => {
      EventsServiceRequest.getEventByIdRequest({ id })
        .then((res) => {
          if (res.data.payload) {
            let event = res.data.payload;

            event.participants.unshift({
              ...event.author,
              owner: true
            })

            delete event.author;

            event.participants = event.participants.map((participant) => {
              return {
                ...participant,
                shortName: `${participant.name} ${participant.surname.charAt(0).toUpperCase()}.`,
                initials: (participant.name.charAt(0) + participant.surname.charAt(0)).toUpperCase()
              }
            })

            resolve(event)
          } else
            throw res.data
        })
        .catch((err) => {
          this.showErrors(err, reject)
        })
    });
  }


  static createEvent(event) {
    return new Promise((resolve, reject) => {
      EventsServiceRequest.createEventRequest(event)
        .then(res => {
          if (res.data.payload)
            resolve(res.data.payload)
          else
            throw res.data
        })
        .catch(err => {
          this.showErrors(err, reject)
        })
    })
  }


  static updateEvent(event) {
    return new Promise((resolve, reject) => {
      EventsServiceRequest.updateEventRequest(event)
        .then(res => {
          if (res.data.payload)
            resolve(res.data.payload)
          else
            throw res.data
        })
        .catch(err => {
          this.showErrors(err, reject)
        })
    })
  }


  static showErrors(err, reject) {
    console.error(`${this.name}`, err)

    const errors = typeof err === 'object' && err.errors
      ? err.errors
      : [{ message: 'Unknown Error' }];

    reject(errors);
  }
}

export default EventsService