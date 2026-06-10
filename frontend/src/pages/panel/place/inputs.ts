import { providerOptions } from 'src/repositories/place'

export default (tagOptions: Array<{ label: string, value: number }> = []) => [
  {
    type: 'hidden',
    name: 'id',
    responseKey: 'id'
  },
  {
    type: 'select',
    name: 'provider',
    responseKey: 'provider',
    label: 'سرویس',
    placeholder: ' ',
    options: providerOptions,
    col: 'col-md-4 col-12'
  },
  {
    type: 'input',
    name: 'external_id',
    responseKey: 'external_id',
    label: 'شناسه خارجی',
    placeholder: ' ',
    col: 'col-md-4 col-12'
  },
  {
    type: 'input',
    name: 'name',
    responseKey: 'name',
    label: 'نام',
    placeholder: ' ',
    col: 'col-md-4 col-12'
  },
  {
    type: 'input',
    name: 'phone',
    responseKey: 'phone',
    label: 'تلفن',
    placeholder: ' ',
    col: 'col-md-4 col-12'
  },
  {
    type: 'input',
    name: 'keyword',
    responseKey: 'keyword',
    label: 'کلمه جستجو',
    placeholder: ' ',
    col: 'col-md-4 col-12'
  },
  {
    type: 'input',
    name: 'lat',
    responseKey: 'lat',
    label: 'عرض جغرافیایی',
    placeholder: ' ',
    col: 'col-md-4 col-12'
  },
  {
    type: 'input',
    name: 'lng',
    responseKey: 'lng',
    label: 'طول جغرافیایی',
    placeholder: ' ',
    col: 'col-md-4 col-12'
  },
  {
    type: 'input',
    name: 'url',
    responseKey: 'url',
    label: 'لینک',
    placeholder: ' ',
    col: 'col-md-8 col-12'
  },
  {
    type: 'textarea',
    name: 'address',
    responseKey: 'address',
    label: 'آدرس',
    placeholder: ' ',
    col: 'col-12'
  },
  {
    type: 'select',
    name: 'tag_ids',
    responseKey: 'tag_ids',
    label: 'برچسب‌ها',
    placeholder: ' ',
    multiple: true,
    emitValue: true,
    mapOptions: true,
    options: tagOptions,
    col: 'col-12'
  }
]
