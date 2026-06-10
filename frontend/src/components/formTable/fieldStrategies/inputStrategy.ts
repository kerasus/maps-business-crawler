import * as shvl from 'shvl'
import { type Row, type FormTableInputType } from '../filedTextStrategy'

export const inputStrategy = (input: FormTableInputType) => (row: Row) => {
  return shvl.get(row, input.responseKey, null)
}
