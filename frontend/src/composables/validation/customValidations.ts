export default {
  idNumber: (value: string): boolean => {
    // Ensure the value is a string and has exactly 10 or 9 or 8 digits
    // const idNumber = String(value).padStart(10, '0')
    if (!/^\d{10}$/.test(value)) {
      return false
    }

    const codeDigits = value.split('').map(Number)

    // Calculate the checksum using the first 9 digits
    let sum = 0
    for (let i = 0; i < 9; i++) {
      const codeDigit = codeDigits[i]
      if (codeDigit) {
        sum += codeDigit * (10 - i)
      }
    }

    // Calculate the remainder when sum is divided by 11
    const remainder = sum % 11

    // If remainder is less than 2, the 10th digit should match the remainder
    // Otherwise, the 10th digit should be 11 minus the remainder
    const checkDigit = codeDigits[9]
    return (
      (remainder < 2 && checkDigit === remainder) ||
      (remainder >= 2 && checkDigit === 11 - remainder)
    )
  },
  legalIdNumber: (value: string): boolean => {
    // const idNumber = String(value).padStart(11, '0')

    // Ensure the value has exactly 11 digits
    if (!/^\d{11}$/.test(value)) {
      return false
    }

    if (value.length < 11 || parseInt(value, 10) === 0) return false

    if (parseInt(value.substr(3, 6), 10) === 0) return false
    const c = parseInt(value.substr(10, 1), 10)
    const d = parseInt(value.substr(9, 1), 10) + 2
    const z = [29, 27, 23, 19, 17]
    let s = 0
    for (let i = 0; i < 10; i++) {
      const res = z[i % 5]
      if (res) {
        s += (d + parseInt(value.substr(i, 1), 10)) * res
      }
    }
    s = s % 11
    if (s === 10) s = 0
    return c === s
  },
  phone: (value: unknown): boolean => {
    if (!value) {
      return true
    }
    const phoneNumber = String(value)
    return /^\+\d+$/.test(phoneNumber)
  }
}
