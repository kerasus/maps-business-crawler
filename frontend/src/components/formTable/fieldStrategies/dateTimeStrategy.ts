import * as shvl from 'shvl'
import { useDate } from 'src/composables/Date'
import { type Row, type FormTableInputType } from '../filedTextStrategy'

export const dateTimeStrategy = (input: FormTableInputType) => (row: Row) => {
  const dateManager = useDate()
  const inputValue = shvl.get(row, input.responseKey, null)
  if (!inputValue) {
    return '-'
  }

  return dateManager.miladiToShamsi(inputValue, 'YYYY-MM-DDTHH:mm:ss', 'jYYYY/jMM/jDD HH:mm')
}
