class Digit {
  public static toEnDigit (value: string): string {
    if (!value) return ''
    const digits = [
      { from: '۰', to: '0' },
      { from: '۱', to: '1' },
      { from: '۲', to: '2' },
      { from: '۳', to: '3' },
      { from: '۴', to: '4' },
      { from: '۵', to: '5' },
      { from: '۶', to: '6' },
      { from: '۷', to: '7' },
      { from: '۸', to: '8' },
      { from: '۹', to: '9' }
    ]
    let result = Digit.normalizeMinus(value).toString()
    digits.forEach((item) => {
      result = result.replace(new RegExp(item.from, 'g'), item.to)
    })
    return result
  }

  public static normalizeMinus (input: string): string {
    return input.replace(/‎-/g, '-').replace(/−/g, '-')
  }
}

export default  Digit
