import moment from "moment"

export function getHumanDate(date) {
    if(!date) return ''
    return moment(date)
        .calendar(null, {
            sameDay: "[Today] MM/DD/YYYY",
            nextDay: "[Tomorrow] MM/DD/YYYY",
            nextWeek: "dddd MM/DD/YYYY",
            lastDay: "[Yesterday] MM/DD/YYYY",
            lastWeek: "[Last] dddd MM/DD/YYYY",
            sameElse: "dddd MM/DD/YYYY",
        })
        .toUpperCase()
}

export function getHumanTime (date) {
    if(!date) return ''
    return moment(date).format("h:mm A");
}

export default {getHumanDate, getHumanTime}