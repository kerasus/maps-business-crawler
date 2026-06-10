import BaseAPI from './BaseAPI'

export type TagType = {
  id: number | null;
  name: string | null;
  slug: string | null;
  color: string | null;
  description: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export default class TagAPI extends BaseAPI<TagType> {
  constructor () {
    super('/tags')
    this.defaultObject = {
      id: null,
      name: null,
      slug: null,
      color: null,
      description: null,
      created_at: null,
      updated_at: null
    }
  }
}
