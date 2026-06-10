import BaseAPI from './BaseAPI'
import type { TagType } from './tag'
import type { AxiosResponse } from 'axios'

export type PlaceType = {
  id: number | null;
  provider: string | null;
  external_id: string | null;
  name: string | null;
  address: string | null;
  phone: string | null;
  lat: number | null;
  lng: number | null;
  url: string | null;
  keyword: string | null;
  raw_data: Record<string, unknown> | null;
  tags: TagType[];
  created_at: string | null;
  updated_at: string | null;
}

export const providerOptions = [
  { label: 'Google', value: 'google' },
  { label: 'Balad', value: 'balad' },
  { label: 'Neshan', value: 'neshan' },
  { label: 'Map.ir', value: 'mapir' }
]

export function getProviderLabel (provider: string | null): string {
  const item = providerOptions.find((option) => option.value === provider)
  return item?.label ?? (provider ?? '-')
}

export default class PlaceAPI extends BaseAPI<PlaceType> {
  constructor () {
    super('/places')
    this.defaultObject = {
      id: null,
      provider: null,
      external_id: null,
      name: null,
      address: null,
      phone: null,
      lat: null,
      lng: null,
      url: null,
      keyword: null,
      raw_data: null,
      tags: [],
      created_at: null,
      updated_at: null
    }
    this.endpoints = {
      ...this.endpoints,
      import: `${this.baseEndpoint}/import`,
      syncTags: (placeId: number) => `${this.baseEndpoint}/${placeId}/tags/sync`
    }
  }

  async import (provider?: string, file?: string) {
    const response: AxiosResponse = await this.getAxiosInstanceWithToken()
      .post(this.endpoints.import, { provider, file })
    return response.data
  }

  async syncTags (placeId: number, tagIds: number[]) {
    const response: AxiosResponse<PlaceType> = await this.getAxiosInstanceWithToken()
      .post(this.endpoints.syncTags(placeId), { tag_ids: tagIds })
    return response.data
  }
}
