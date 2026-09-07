import { useEffect, useRef, useState } from 'react';

export interface AsyncSelectOption {
  value: string;
  label: string;
  description?: string;
  group?: string;
  disabled?: boolean;
}

export interface AsyncOptionsLoadContext { signal: AbortSignal }
export type AsyncOptionsLoader = (query: string, context: AsyncOptionsLoadContext) => Promise<AsyncSelectOption[]>;
export type AsyncOptionsStatus = 'idle' | 'loading' | 'ready' | 'error';

interface UseAsyncOptionsProps {
  loadOptions: AsyncOptionsLoader;
  query?: string;
  defaultQuery?: string;
  onQueryChange?: (query: string) => void;
  initialOptions?: AsyncSelectOption[];
  selectedOptions?: AsyncSelectOption[];
  minQueryLength?: number;
  debounceMs?: number;
  onLoadError?: (error: unknown, query: string) => void;
}

export function useAsyncOptions({ loadOptions, query: controlledQuery, defaultQuery = '', onQueryChange, initialOptions = [], selectedOptions = [], minQueryLength = 0, debounceMs = 200, onLoadError }: UseAsyncOptionsProps) {
  const [internalQuery, setInternalQuery] = useState(defaultQuery);
  const query = controlledQuery ?? internalQuery;
  const [options, setOptions] = useState(initialOptions);
  const [status, setStatus] = useState<AsyncOptionsStatus>(query.trim().length < minQueryLength ? 'idle' : initialOptions.length ? 'ready' : 'loading');
  const [loadError, setLoadError] = useState<string>();
  const [retryVersion, setRetryVersion] = useState(0);
  const requestId = useRef(0);
  const loaderRef = useRef(loadOptions);
  const errorRef = useRef(onLoadError);
  const cache = useRef(new Map<string, AsyncSelectOption>());
  loaderRef.current = loadOptions;
  errorRef.current = onLoadError;
  for (const option of [...initialOptions, ...options, ...selectedOptions]) cache.current.set(option.value, option);

  function changeQuery(next: string) {
    if (controlledQuery === undefined) setInternalQuery(next);
    onQueryChange?.(next);
  }

  useEffect(() => {
    const normalized = query.trim();
    if (normalized.length < minQueryLength) {
      requestId.current += 1;
      setStatus('idle');
      setLoadError(undefined);
      setOptions([]);
      return;
    }
    const currentRequest = ++requestId.current;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setStatus('loading');
      setLoadError(undefined);
      setOptions([]);
      void loaderRef.current(query, { signal: controller.signal }).then(result => {
        if (controller.signal.aborted || requestId.current !== currentRequest) return;
        for (const option of result) cache.current.set(option.value, option);
        setOptions(result);
        setStatus('ready');
      }).catch(cause => {
        if (controller.signal.aborted || requestId.current !== currentRequest) return;
        setStatus('error');
        setLoadError(cause instanceof Error && cause.message ? cause.message : '查询失败');
        errorRef.current?.(cause, query);
      });
    }, Math.max(0, debounceMs));
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [query, minQueryLength, debounceMs, retryVersion]);

  return { query, changeQuery, options, status, loadError, retry: () => setRetryVersion(version => version + 1), cache };
}
