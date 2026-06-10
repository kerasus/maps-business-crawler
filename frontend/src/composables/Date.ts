import jalaliMoment, { from as jalaliFrom } from 'jalali-moment'

export const useDate = () => {
  function shamsiToMiladi (
    date: string | undefined,
    shamsiFormat: string = 'jYYYY/jMM/jDD',
    miladiFormat: string = 'YYYY-MM-DD'
  ) {
    if (!date) {
      console.error('shamsi date is not valid')
      return ''
    }
    return jalaliMoment(date, shamsiFormat, 'fa').locale('en').format(miladiFormat)
  }

  function miladiToShamsi (
    date: string | undefined,
    miladiFormat: string = 'YYYY-MM-DD',
    shamsiFormat: string = 'jYYYY/jMM/jDD'
  ) {
    if (!date) {
      console.error('miladi date is not valid')
      return ''
    }
    return jalaliFrom(date, 'en', miladiFormat).format(shamsiFormat)
  }

  function now (format: string = 'YYYY-MM-DD') {
    return jalaliFrom(new Date().toISOString(), 'en').format(format)
  }

  function validationShamsiDate (date: string | undefined) {
    function isShamsiLeapYear () {
      if (!date) {
        return false
      }
      return jalaliFrom(date, 'fa', 'jYYYY').jIsLeapYear()
    }

    let message: string | null = null
    let shamsiDate: string | null = null

    if (date === '____/__/__') {
      return {
        shamsiDate: null,
        isValid: true,
        message: null
      }
    }

    const pattern = /^(\d{4})\/(\d{2})\/(\d{2})$/
    if (!date || !pattern.test(date)) {
      message = 'error.validation.incompleteDate'
    }
    try {
      const [year, month, day] = date
        ? date.split('/').map((part: any) => parseInt(part, 10))
        : [0, 0, 0]

      if (year && year < 1200) {
        message = 'error.validation.yearUnder1200'
      }

      if (month && (month < 1 || month > 12)) {
        message = 'error.validation.invalidMonth'
      }

      // Day check based on the month and leap year status for Esfand
      const isLeapYear = isShamsiLeapYear()

      if (
        month &&
        ((month >= 1 && month <= 6 && day && (day < 1 || day > 31)) ||
          (month >= 7 && month <= 11 && day && (day < 1 || day > 30)) ||
          (month === 12 && day && (day < 1 || day > (isLeapYear ? 30 : 29))))
      ) {
        message = 'error.validation.invalidDay'
      }

      shamsiDate = `${year}/${month?.toString().padStart(2, '0')}/${day?.toString().padStart(2, '0')}`
    } catch {
      message = 'error.validation.invalidYear'
    }
    return {
      shamsiDate,
      isValid: !message,
      message
    }
  }

  function parseTime (time: string | undefined) {
    if (!time) {
      console.error('time is not valid')
      return null
    }

    const [hour, minute, second] = time.split(':').map((part: any) => parseInt(part, 10))

    const formattedHour = String(hour).padStart(2, '0')
    const formattedMinute = String(minute).padStart(2, '0')
    const formattedSecond = String(second).padStart(2, '0')

    return {
      hour,
      minute,
      second,
      formattedHour,
      formattedMinute,
      formattedSecond
    }
  }

  function validationTime (time: string | undefined) {
    let message: string | null = null
    let validTime: string | null = null

    if (time === '__:__:__') {
      return {
        validTime: null,
        isValid: true,
        message: null
      }
    }
    if (!time) {
      return {
        validTime: null,
        isValid: false,
        message: null
      }
    }

    const pattern = /^(\d{2}):(\d{2}):(\d{2})$/
    if (!pattern.test(time)) {
      message = 'error.validation.incompleteTime'
    }

    const parsedTime = parseTime(time)

    if (parsedTime) {
      const hour = parsedTime.hour
      const minute = parsedTime.minute
      const second = parsedTime.second
      const formattedHour = parsedTime.formattedHour
      const formattedMoment = parsedTime.formattedMinute
      const formattedSecond = parsedTime.formattedSecond

      if (hour && (hour < 0 || hour >= 24)) {
        message = 'error.validation.invalidHour'
      }

      if (minute && (minute < 0 || minute >= 60)) {
        message = 'error.validation.invalidMinute'
      }
      if (second && (second < 0 || second >= 60)) {
        message = 'error.validation.invalidSecond'
      }
      validTime = `${formattedHour}:${formattedMoment}:${formattedSecond}`
    }

    return {
      validTime,
      isValid: !message,
      message
    }
  }

  function getDateTimeFromIso8601DateString (isoString: string) {
    const date = new Date(isoString)
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const seconds = date.getSeconds().toString().padStart(2, '0')
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return {
      date: `${year}-${month}-${day}`,
      time: `${hours}:${minutes}:${seconds}`
    }
  }

  return {
    now,
    parseTime,
    shamsiToMiladi,
    miladiToShamsi,
    validationTime,
    validationShamsiDate,
    getDateTimeFromIso8601DateString
  }
}
