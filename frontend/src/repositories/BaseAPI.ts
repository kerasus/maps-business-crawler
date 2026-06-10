import type { AxiosError, AxiosResponse } from 'axios'
import { axiosInstanceManager } from 'src/boot/axios'

export type ListType<T> = {
  data: T[];
  current_page: number;
  per_page: number;
  from: number;
  to: number;
  total: number;
};

export type Endpoints = {
  base: string;
  byId: (id: number) => string;
  [key: string]: any;
};

export interface MainFlagStates {
  active: boolean;
}

export enum MainFlagKeys {
  ACTIVE = 1,
}

interface CacheEntry {
  data: any;
  expiry: number;
}

export default class BaseAPI<T> {
  public baseEndpoint: string
  public defaultObject: T
  public endpoints: Endpoints

  constructor (baseEndpoint: string) {
    this.baseEndpoint = baseEndpoint
    this.defaultObject = {} as T
    this.endpoints = {
      base: this.baseEndpoint,
      byId: (id: number) => this.baseEndpoint + '/' + id
    }
  }

  getAxiosInstanceWithToken () {
    const axiosManager = axiosInstanceManager

    const cache = new Map<string, CacheEntry>()
    const pendingRequests = new Map<string, Promise<AxiosResponse | AxiosError>>()
    function cacheData (url: string, response: AxiosResponse, ttl: number): void {
      cache.set(url, {
        data: response.data,
        expiry: Date.now() + ttl
      })
    }
    function getCachedData (url: string): AxiosResponse | null {
      const cacheEntry = cache.get(url)
      if (cacheEntry) {
        if (cacheEntry.expiry > Date.now()) {
          // Cache is still valid
          return {
            data: cacheEntry.data,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
          } as AxiosResponse
        } else {
          // Cache has expired
          cache.delete(url)
        }
      }
      return null
    }

    // Add the `getWithCache` method to the instance
    axiosManager.axiosInstance.getWithCache = async (url: string, config = {}): Promise<AxiosResponse<any>> => {
      try {
        // 1. Check the cache first
        const cachedData = getCachedData(url)
        if (cachedData) {
          return Promise.resolve(cachedData)
        }

        // 2. Check if there's an ongoing request for the same URL
        if (pendingRequests.has(url)) {
          return pendingRequests.get(url) as Promise<AxiosResponse<any>>
        }

        // 3. Create the request promise and cache it
        const requestPromise = axiosManager.axiosInstance
          .get(url, config)
          .then((response) => {
            const ttl = config.cache?.ttl || 1000 * 60 * 5 // Default TTL: 5 minutes
            cacheData(url, response, ttl) // Cache the response
            pendingRequests.delete(url) // Remove from pendingRequests once done
            return response
          })
          .catch((error) => {
            pendingRequests.delete(url) // Remove from pendingRequests on error
            return Promise.reject(error)
          })

        pendingRequests.set(url, requestPromise) // Store the promise in the map

        return requestPromise // Return the ongoing request promise
      } catch (error) {
        console.error(`Error fetching with cache for URL "${url}":`, error)
        return Promise.reject(error)
      }
    }

    return axiosManager.axiosInstance
  }

  getAxiosInstanceWithoutToken () {
    return axiosInstanceManager.axiosInstanceWithoutToken
  }

  normalize<U> (response: Partial<U>, defaultValues: U): U {
    return { ...defaultValues, ...response }
  }

  protected async fetchAndNormalize (id: number): Promise<T> {
    const response = await this.getAxiosInstanceWithToken().get(this.endpoints.byId(id))
    return this.getNormalizedItem(this.normalize(response.data, this.defaultObject))
  }

  async index (filters: any = { length: 10 }): Promise<ListType<T>> {
    return new Promise((resolve, reject) => {
      this.getAxiosInstanceWithToken()
        .get(this.endpoints.base, {
          params: this.getNormalizedIndexFilter(filters)
        })
        .then((response) => {
          const normalizedListType = this.getNormalizedListType(response)
          normalizedListType.data = this.getNormalizedList(normalizedListType.data)
          resolve(normalizedListType)
        })
        .catch((e) => {
          console.error(e)
          reject(e)
        })
    })
  }

  getNormalizedListType (response: AxiosResponse<ListType<T>>): ListType<T> {
    return {
      data: response.data.data,
      from: response.data.from,
      to: response.data.to,
      current_page: response.data.current_page,
      per_page: response.data.per_page,
      total: response.data.total
    }
  }

  getNormalizedIndexFilter (filters: any = { length: 10 }) {
    return filters
  }

  getNormalizedList (list: any[]) {
    return list.map((item: any) => {
      return this.getNormalizedItem(item)
    })
  }

  getNormalizedItem (item: any) {
    item.flagStates = this.parseFlag()
    return item
  }

  async create (data: T | FormData): Promise<number> {
    try {
      const response: AxiosResponse<{ id: number }> = await this.getAxiosInstanceWithToken().post(
        this.endpoints.base,
        data
      )
      return response.data.id
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message) // Access the message property
      } else {
        throw new Error('An unknown error occurred on create') // Handle non-Error types
      }
    }
  }

  async get (id: number, useCache: boolean = true, ttl: number = 1000): Promise<T> {
    const a = this.getAxiosInstanceWithToken()
    const url = this.endpoints.byId(id)
    const response = useCache
      ? await a.getWithCache(url, {
        // Enable caching for this request if `useCache` is true
        useCache,
        cache: {
          ttl
        }
      })
      : await a.get(url)

    return this.getNormalizedItem(this.normalize(response.data, this.defaultObject))
  }

  async update (id: number, data: T | FormData): Promise<void | Error> {
    try {
      await this.getAxiosInstanceWithToken().put(this.endpoints.byId(id), data)
    } catch {
      return new Error()
    }
  }

  async delete (id: number): Promise<void | Error> {
    return new Promise((resolve, reject) => {
      this.getAxiosInstanceWithToken()
        .delete(this.endpoints.byId(id))
        .then(() => {
          resolve()
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  async activate (id: number): Promise<void | Error> {
    try {
      await this.getAxiosInstanceWithToken().patch(this.endpoints.byId(id))
    } catch {
      return new Error()
    }
  }

  parseFlag (): MainFlagStates {
    return {
      active: true
    }
  }
}
