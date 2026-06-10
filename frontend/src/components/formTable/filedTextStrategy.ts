import type { FormBuilderInputType } from 'src/types'
import {
  inputStrategy,
  selectStrategy,
  dateStrategy,
  fileStrategy,
  dateTimeStrategy,
  timeStrategy
} from './fieldStrategies'

export interface FormTableInputType extends FormBuilderInputType {
  allOptions?: any[];
  createNewValue?: boolean;
  columnAlign?: 'left' | 'right' | 'center';
  tableFiled?: (row: any) => string;
  unFilterAble?: boolean;
  unvisibleColumn?: boolean;
}

export type Row = {
  bank: { id: number; title: string };
  branch: number;
  branch_info: { id: number; name: string };
  branchCode: string;
  bankProvince: string;
  bankCity: string;
  accountType: string;
  accountNumber: string;
  iban: string;
  accountNumberConfirmation: string;
  defaultAccountNumber: string;
};

const createFieldFunction = (input: FormTableInputType) => {
  switch (true) {
    case input.type === 'select':
      return selectStrategy(input)
    case input.type === 'input' ||
      (typeof input.type !== 'string' && input.type?.name === 'FormBuilderInput'):
      return inputStrategy(input)
    case input.type === 'file' ||
      (typeof input.type !== 'string' && input.type?.name === 'FormBuilderFile'):
      return fileStrategy(input)
    case input.type === 'date' ||
      (typeof input.type !== 'string' && input.type?.name === 'FormBuilderDate'):
      return dateStrategy(input)
    case input.type === 'time' ||
      (typeof input.type !== 'string' && input.type?.name === 'FormBuilderTime'):
      return timeStrategy(input)
    case input.type === 'dateTime' ||
      (typeof input.type !== 'string' && input.type?.name === 'FormBuilderDateTime'):
      return dateTimeStrategy(input)
    default:
      return () => ''
  }
}

export default createFieldFunction
