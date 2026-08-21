'use client'

import { useState, useCallback, useEffect } from 'react'
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client'
import { logger } from '@/lib/logger'
import { toast } from 'sonner'

export interface UseCrudResourceOptions<T> {
  baseEndpoint: string
  resourceName: string
  initialParams?: Record<string, string | number | boolean>
  autoFetch?: boolean
  transformResponse?: (data: any) => T[]
  transformItem?: (data: any) => T
}

export function useCrudResource<T extends { id?: string | number }>(
  options: UseCrudResourceOptions<T>
) {
  const {
    baseEndpoint,
    resourceName,
    initialParams = {},
    autoFetch = true,
    transformResponse,
    transformItem,
  } = options

  const [items, setItems] = useState<T[]>([])
  const [selectedItem, setSelectedItem] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isMutating, setIsMutating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [params, setParams] = useState<Record<string, string | number | boolean>>(initialParams)

  const fetchItems = useCallback(
    async (customParams?: Record<string, string | number | boolean>) => {
      setIsLoading(true)
      setError(null)
      try {
        const queryParams = { ...params, ...(customParams || {}) }
        const queryString = new URLSearchParams(
          Object.entries(queryParams).reduce((acc, [k, v]) => {
            if (v !== undefined && v !== null && v !== '') {
              acc[k] = String(v)
            }
            return acc
          }, {} as Record<string, string>)
        ).toString()

        const endpoint = queryString ? `${baseEndpoint}?${queryString}` : baseEndpoint
        const data = await apiGet<any>(endpoint, {
          showErrorToast: true,
          context: `useCrudResource(${resourceName})`,
        })

        if (data) {
          let list: T[] = []
          if (transformResponse) {
            list = transformResponse(data)
          } else if (Array.isArray(data)) {
            list = data
          } else if (Array.isArray(data.items)) {
            list = data.items
          } else if (Array.isArray(data[resourceName.toLowerCase() + 's'])) {
            list = data[resourceName.toLowerCase() + 's']
          } else {
            list = (Object.values(data).find(Array.isArray) as T[]) || []
          }
          setItems(list)
          return list
        }
        return []
      } catch (err: any) {
        const message = err?.message || `Failed to fetch ${resourceName}`
        setError(message)
        logger.error(`[useCrudResource] Exception fetching ${resourceName}:`, err)
        return []
      } finally {
        setIsLoading(false)
      }
    },
    [baseEndpoint, resourceName, params, transformResponse]
  )

  const createItem = useCallback(
    async (payload: Partial<T>): Promise<T | null> => {
      setIsMutating(true)
      setError(null)
      try {
        const data = await apiPost<any>(baseEndpoint, payload, {
          showSuccessToast: true,
          showErrorToast: true,
          successMessage: `${resourceName} created successfully`,
          context: `useCrudResource(${resourceName})`,
        })

        if (data) {
          const created: T = transformItem
            ? transformItem(data)
            : data[resourceName.toLowerCase()] || data.item || data
          setItems((prev) => [created, ...prev])
          return created
        }
        return null
      } catch (err: any) {
        const message = err?.message || `Failed to create ${resourceName}`
        setError(message)
        logger.error(`[useCrudResource] Exception creating ${resourceName}:`, err)
        return null
      } finally {
        setIsMutating(false)
      }
    },
    [baseEndpoint, resourceName, transformItem]
  )

  const updateItem = useCallback(
    async (id: string | number, payload: Partial<T>): Promise<T | null> => {
      setIsMutating(true)
      setError(null)
      try {
        const endpoint = `${baseEndpoint}/${id}`
        const data = await apiPut<any>(endpoint, payload, {
          showSuccessToast: true,
          showErrorToast: true,
          successMessage: `${resourceName} updated successfully`,
          context: `useCrudResource(${resourceName})`,
        })

        if (data) {
          const updated: T = transformItem
            ? transformItem(data)
            : data[resourceName.toLowerCase()] || data.item || data
          setItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
          )
          return updated
        }
        return null
      } catch (err: any) {
        const message = err?.message || `Failed to update ${resourceName}`
        setError(message)
        logger.error(`[useCrudResource] Exception updating ${resourceName}:`, err)
        return null
      } finally {
        setIsMutating(false)
      }
    },
    [baseEndpoint, resourceName, transformItem]
  )

  const deleteItem = useCallback(
    async (id: string | number): Promise<boolean> => {
      setIsMutating(true)
      setError(null)
      try {
        const endpoint = `${baseEndpoint}/${id}`
        await apiDelete<any>(endpoint, {
          showSuccessToast: true,
          showErrorToast: true,
          successMessage: `${resourceName} deleted successfully`,
          context: `useCrudResource(${resourceName})`,
        })

        setItems((prev) => prev.filter((item) => item.id !== id))
        return true
      } catch (err: any) {
        const message = err?.message || `Failed to delete ${resourceName}`
        setError(message)
        logger.error(`[useCrudResource] Exception deleting ${resourceName}:`, err)
        return false
      } finally {
        setIsMutating(false)
      }
    },
    [baseEndpoint, resourceName]
  )

  useEffect(() => {
    if (autoFetch) {
      fetchItems()
    }
  }, [autoFetch, fetchItems])

  return {
    items,
    setItems,
    selectedItem,
    setSelectedItem,
    isLoading,
    isMutating,
    error,
    params,
    setParams,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
  }
}
