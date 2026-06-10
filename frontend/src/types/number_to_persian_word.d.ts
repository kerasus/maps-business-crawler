declare module 'number_to_persian_word' {
  export interface NumberToPersianWord {
    convert: (number: string | number) => string;
    sliceNumber: (number: string | number, separator?: string) => string;
    convertEnToPe: (number: string | number) => string;
    convertPeToEn: (number: string | number) => string;
  }

  const NumberToPersianWord: NumberToPersianWord
  export default NumberToPersianWord
}
