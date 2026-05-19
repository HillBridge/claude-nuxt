// app/utils/http/base-repository.ts
// Repository 基类 - 封装 CRUD 操作，业务 Repository 继承此类
// 目标：业务代码零样板，只需声明接口路径和类型

import { useHttpClient } from './client'

import type { PaginatedResult, PaginationParams, QueryParams } from '~/types'

export abstract class BaseRepository<
  TEntity,
  TCreateDTO = Partial<TEntity>,
  TUpdateDTO = Partial<TEntity>,
  TQuery extends QueryParams = QueryParams,
> {
  private _http?: ReturnType<typeof useHttpClient>
  protected get http() {
    if (!this._http) this._http = useHttpClient()
    return this._http
  }

  constructor(protected readonly basePath: string) {}

  // ---- 列表（带分页）----
  async list(params?: TQuery): Promise<PaginatedResult<TEntity>> {
    return this.http<PaginatedResult<TEntity>>(this.basePath, {
      method: 'GET',
      query: params,
    })
  }

  // ---- 全量列表（无分页，用于下拉选项等）----
  async all(params?: Omit<TQuery, keyof PaginationParams>): Promise<TEntity[]> {
    return this.http<TEntity[]>(`${this.basePath}/all`, {
      method: 'GET',
      query: params,
    })
  }

  // ---- 单条查询 ----
  async getById(id: number | string): Promise<TEntity> {
    return this.http<TEntity>(`${this.basePath}/${id}`)
  }

  // ---- 创建 ----
  async create(data: TCreateDTO): Promise<TEntity> {
    return this.http<TEntity>(this.basePath, {
      method: 'POST',
      body: data,
    })
  }

  // ---- 更新（PUT 全量替换）----
  async update(id: number | string, data: TUpdateDTO): Promise<TEntity> {
    return this.http<TEntity>(`${this.basePath}/${id}`, {
      method: 'PUT',
      body: data,
    })
  }

  // ---- 部分更新（PATCH）----
  async patch(id: number | string, data: Partial<TUpdateDTO>): Promise<TEntity> {
    return this.http<TEntity>(`${this.basePath}/${id}`, {
      method: 'PATCH',
      body: data,
    })
  }

  // ---- 删除 ----
  async remove(id: number | string): Promise<void> {
    await this.http(`${this.basePath}/${id}`, { method: 'DELETE' })
  }

  // ---- 批量删除 ----
  async batchRemove(ids: (number | string)[]): Promise<void> {
    await this.http(`${this.basePath}/batch`, {
      method: 'DELETE',
      body: { ids },
    })
  }

  // ---- 文件上传 ----
  async upload(
    file: File,
    extraData?: Record<string, unknown>,
    onProgress?: (percent: number) => void,
  ): Promise<{ url: string; key: string }> {
    const formData = new FormData()
    formData.append('file', file)
    if (extraData) {
      Object.entries(extraData).forEach(([key, value]) => {
        formData.append(key, String(value))
      })
    }
    return this.http<{ url: string; key: string }>(`${this.basePath}/upload`, {
      method: 'POST',
      body: formData,
      onUploadProgress: (event) => {
        if (onProgress && event.total) {
          onProgress(Math.round((event.loaded / event.total) * 100))
        }
      },
    })
  }
}
