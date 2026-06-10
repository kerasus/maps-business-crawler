export default () => [
  {
    type: 'hidden',
    name: 'id',
    responseKey: 'id'
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
    name: 'slug',
    responseKey: 'slug',
    label: 'اسلاگ',
    placeholder: ' ',
    col: 'col-md-4 col-12'
  },
  {
    type: 'color',
    name: 'color',
    responseKey: 'color',
    label: 'رنگ',
    placeholder: ' ',
    col: 'col-md-4 col-12'
  },
  {
    type: 'textarea',
    name: 'description',
    responseKey: 'description',
    label: 'توضیحات',
    placeholder: ' ',
    col: 'col-12'
  }
]
