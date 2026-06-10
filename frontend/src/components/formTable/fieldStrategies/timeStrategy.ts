import * as shvl from 'shvl'
import { type FormTableInputType, type Row } from '../filedTextStrategy'

export const timeStrategy = (input: FormTableInputType) => (row: Row) => {
  return shvl.get(row, input.responseKey, null)
}
