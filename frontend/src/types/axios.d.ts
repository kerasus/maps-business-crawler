import type {
  AxiosInstance as OriginalAxiosInstance,
  AxiosResponse as OriginalAxiosResponse,
  AxiosRequestConfig as OriginalAxiosRequestConfig
} from 'axios'

declare module 'axios' {
  interface AxiosRequestConfig extends OriginalAxiosRequestConfig {
    useCache?: boolean;
    cache?: {
      ttl?: number;
    };
  }

  // Extend AxiosInstance to include getWithCache
  interface AxiosInstance extends OriginalAxiosInstance {
    getWithCache(url: string, config?: AxiosRequestConfig): Promise<OriginalAxiosResponse>;
  }
}
