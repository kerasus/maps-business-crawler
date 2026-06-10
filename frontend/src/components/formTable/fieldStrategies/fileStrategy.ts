import * as shvl from 'shvl'
import { type Row, type FormTableInputType } from '../filedTextStrategy'

export const fileStrategy = (input: FormTableInputType) => (row: Row) => {
  const inputValue = shvl.get(row, input.responseKey, null)
  const fullFileUrl = inputValue

  // ToDo: handle get token from some audience (client app id)
  return '<img alt="file-tumbnail" style="width: 64px;" src="' + fullFileUrl + '" />'
}
