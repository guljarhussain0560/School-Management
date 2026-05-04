'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface UseApiResourceOptions<T> {
  endpoint: string
  params?: Record<string, string | number | boolean | undefined | null>
  initialData?: T[]
  autoFetch?: boolean
  debounceMs?: number
  onError?: (error: Error) => void
  transformResponse?: (data: any) => { items: T[]; total?: number; totalPages?: number }
}

export interface UseApiResourceReturn<T> {
  data: T[]
  isLoading: boolean
  isError: boolean
  error: Error | null
  pagination: PaginationMeta
  setPage: (page: number) => void
  setLimit: (limit: number) => void
  refetch: () => Promise<void>
  setData: React.Dispatch<React.SetStateAction<T[]>>
  mutateItem: (id: string, updated: Partial<T>) => void
  removeItem: (id: string) => void
  addItem: (item: T) => void
}

export function useApiResource<T extends { id?: string }>(
  options: UseApiResourceOptions<T>
): UseApiResourceReturn<T> {
  const {
    endpoint,
    params = {},
    initialData = [],
    autoFetch = true,
    debounceMs = 0,
    onError,
    transformResponse,
  } = options

  const [data, setData] = useState<T[]>(initialData)
  const [isLoading, setIsLoading] = useState<boolean>(autoFetch)
  const [isError, setIsError] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)
  const [page, setPage] = useState<number>(1)
  const [limit, setLimit] = useState<number>(10)
  const [total, setTotal] = useState<number>(0)
  const [totalPages, setTotalPages] = useState<number>(1)

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setIsError(false)
    setError(null)

    try {
      const url = new URL(endpoint, window.location.origin)
      url.searchParams.set('page', page.toString())
      url.searchParams.set('limit', limit.toString())

      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          url.searchParams.set(key, String(val))
        }
      })

      const res = await fetch(url.toString())
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}: ${res.statusText}`)
      }

      const json = await res.json()

      if (transformResponse) {
        const transformed = transformResponse(json)
        setData(transformed.items)
        if (transformed.total !== undefined) {
          setTotal(transformed.total)
          setTotalPages(transformed.totalPages || Math.ceil(transformed.total / limit) || 1)
        }
      } else {
        // Automatic heuristic parser for common API patterns
        const items = json.items || json.data || json.students || json.employees || json.classes || json.buses || json.records || (Array.isArray(json) ? json : [])
        setData(items)

        const paginationTotal = json.pagination?.total || json.pagination?.totalCount || json.total || items.length
        const pagesCount = json.pagination?.totalPages || json.pagination?.pages || Math.ceil(paginationTotal / limit) || 1

        setTotal(paginationTotal)
        setTotalPages(pagesCount)
      }
    } catch (err: any) {
      const e = err instanceof Error ? err : new Error(String(err))
      setIsError(true)
      setError(e)
      toast.error(e.message || 'Failed to load resource data')
      if (onError) onError(e)
    } finally {
      setIsLoading(false)
    }
  }, [endpoint, page, limit, JSON.stringify(params), transformResponse, onError])

  useEffect(() => {
    if (!autoFetch) return

    if (debounceMs > 0) {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current)
      debounceTimeoutRef.current = setTimeout(() => {
        fetchData()
      }, debounceMs)
      return () => {
        if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current)
      }
    } else {
      fetchData()
    }
  }, [fetchData, autoFetch, debounceMs])

  const mutateItem = useCallback((id: string, updated: Partial<T>) => {
    setData(prev => prev.map(item => ((item as any).id === id ? { ...item, ...updated } : item)))
  }, [])

  const removeItem = useCallback((id: string) => {
    setData(prev => prev.filter(item => (item as any).id !== id))
    setTotal(prev => Math.max(0, prev - 1))
  }, [])

  const addItem = useCallback((item: T) => {
    setData(prev => [item, ...prev])
    setTotal(prev => prev + 1)
  }, [])

  return {
    data,
    isLoading,
    isError,
    error,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
    setPage,
    setLimit,
    refetch: fetchData,
    setData,
    mutateItem,
    removeItem,
    addItem,
  }
}
