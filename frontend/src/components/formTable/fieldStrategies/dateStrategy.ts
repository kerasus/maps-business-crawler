import * as shvl from 'shvl'
import { useDate } from 'src/composables/Date'
import { type Row, type FormTableInputType } from '../filedTextStrategy'

export const dateStrategy = (input: FormTableInputType) => (row: Row) => {
  const dateManager = useDate()
  const inputValue = shvl.get(row, input.responseKey, null)
  if (!inputValue) {
    return '-'
  }

  return dateManager.miladiToShamsi(inputValue)
}
