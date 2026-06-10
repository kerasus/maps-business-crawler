import * as shvl from 'shvl'
import { type Row, type FormTableInputType } from '../filedTextStrategy'

export const selectStrategy = (input: FormTableInputType) => (row: Row) => {
  if (input.tableFiled) {
    return input.tableFiled(row)
  }
  const getOptionValueKey = (input: FormTableInputType): string => {
    const defaultKey = 'value'
    if (!input.optionValue) {
      return defaultKey
    }

    return input.optionValue
  }
  const getOptionLabelKey = (input: FormTableInputType): string => {
    const defaultKey = 'label'
    if (!input.optionLabel) {
      return defaultKey
    }

    return input.optionLabel
  }
  const optionValueKey = getOptionValueKey(input)
  const optionLabelKey = getOptionLabelKey(input)
  const allOptions = input.allOptions || input.options

  function isSelectedOption (option: any, row: any) {
    if (typeof option !== 'object') {
      return option === shvl.get(row, input.responseKey, null)
    }

    return option[optionValueKey] === shvl.get(row, input.responseKey, null)
  }

  if (input.createNewValue) {
    const value = shvl.get(row, input.responseKey, null)
    if (input.multiple) {
      return value.join(', ')
    }
    return value
  }

  if (!input.multiple) {
    const option = allOptions?.find((opt) => isSelectedOption(opt, row))
    return option ? option[optionLabelKey] : ''
  }

  const options = allOptions?.filter((opt) => isSelectedOption(opt, row))
  return options?.join(', ')
}
