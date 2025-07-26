import { useState, useCallback, useRef, useEffect } from 'react';
import { ActionProcessor } from '../services/actions/ActionProcessor.js';
import type { ProcessResult, ProcessorStatus, ProcessorCostBreakdown } from '../services/actions/ActionProcessor.js';
import { toError } from '../utils/errors.js';

export interface UseActionProcessorOptions {
  fluxApiKey?: string;
  openaiApiKey?: string;
  onComplete?: (result: ProcessResult) => void;
  onError?: (error: Error) => void;
  useMockExecutors?: boolean;
}

export interface UseActionProcessorResult {
  processActions: (json: string | object) => Promise<void>;
  status: ProcessorStatus;
  lastResult: ProcessResult | null;
  error: Error | null;
  costBreakdown: ProcessorCostBreakdown;
  isProcessing: boolean;
  reset: () => void;
}

export function useActionProcessor(options: UseActionProcessorOptions = {}): UseActionProcessorResult {
  const [status, setStatus] = useState<ProcessorStatus>({
    isProcessing: false,
    currentAction: null,
    progress: 0,
    queueLength: 0
  });
  
  const [lastResult, setLastResult] = useState<ProcessResult | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [costBreakdown, setCostBreakdown] = useState<ProcessorCostBreakdown>({
    images: { count: 0, cost: 0 },
    audio: { count: 0, cost: 0 },
    total: 0
  });

  const processorRef = useRef<ActionProcessor | null>(null);
  const statusIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize processor
  useEffect(() => {
    const initProcessor = async () => {
      let executors = undefined;
      
      // Use mock executors if requested
      if (options.useMockExecutors) {
        const { MockImageAssetExecutor, MockSubtitleAssetExecutor, MockCutsceneAssetExecutor } = 
          await import('../services/actions/executors/mocks.js');
        
        executors = {
          asset_image: new MockImageAssetExecutor(),
          asset_subtitle: new MockSubtitleAssetExecutor(),
          asset_cutscene: new MockCutsceneAssetExecutor()
        };
      }

      processorRef.current = new ActionProcessor({
        executors,
        apiKeys: {
          fluxApiKey: options.fluxApiKey || import.meta.env.VITE_FLUX_API_KEY,
          openaiApiKey: options.openaiApiKey || import.meta.env.VITE_OPENAI_API_KEY
        }
      });
    };

    initProcessor();

    return () => {
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current);
      }
    };
  }, [options.fluxApiKey, options.openaiApiKey, options.useMockExecutors]);

  const processActions = useCallback(async (json: string | object) => {
    if (!processorRef.current) {
      const err = new Error('ActionProcessor not initialized');
      setError(err);
      options.onError?.(err);
      return;
    }

    try {
      setError(null);
      
      // Start status polling
      statusIntervalRef.current = setInterval(() => {
        if (processorRef.current) {
          const currentStatus = processorRef.current.getStatus();
          setStatus(currentStatus);
          
          if (!currentStatus.isProcessing && statusIntervalRef.current) {
            clearInterval(statusIntervalRef.current);
            statusIntervalRef.current = null;
          }
        }
      }, 100);

      const result = await processorRef.current.processActions(json);
      
      setLastResult(result);
      setStatus(processorRef.current.getStatus());
      setCostBreakdown(processorRef.current.getCostBreakdown());

      if (result.success) {
        options.onComplete?.(result);
      } else {
        const err = result.errors[0] || new Error('Processing failed');
        setError(err);
        options.onError?.(err);
      }
    } catch (err) {
      const error = toError(err, 'Action processing failed');
      setError(error);
      options.onError?.(error);
      
      // Stop status polling on error
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current);
        statusIntervalRef.current = null;
      }
      
      setStatus({
        isProcessing: false,
        currentAction: null,
        progress: 0,
        queueLength: 0
      });
    }
  }, [options]);

  const reset = useCallback(() => {
    setStatus({
      isProcessing: false,
      currentAction: null,
      progress: 0,
      queueLength: 0
    });
    setLastResult(null);
    setError(null);
    setCostBreakdown({
      images: { count: 0, cost: 0 },
      audio: { count: 0, cost: 0 },
      total: 0
    });
    
    if (statusIntervalRef.current) {
      clearInterval(statusIntervalRef.current);
      statusIntervalRef.current = null;
    }
  }, []);

  return {
    processActions,
    status,
    lastResult,
    error,
    costBreakdown,
    isProcessing: status.isProcessing,
    reset
  };
}