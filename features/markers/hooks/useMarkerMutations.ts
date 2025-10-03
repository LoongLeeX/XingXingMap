/**
 * Marker Mutations Hook
 */

'use client';

import { useState } from 'react';
import { CreateMarkerDTO, UpdateMarkerDTO } from '@/clientservershare/types/marker.types';
import {
  createMarkerAction,
  updateMarkerAction,
  deleteMarkerAction,
} from '@/server/src/features/markers/actions/marker-actions';

export function useMarkerMutations() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const createMarker = async (data: CreateMarkerDTO) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await createMarkerAction(data);
      
      if (result.success) {
        return result.data;
      } else {
        setError(result.error || 'Failed to create marker');
        throw new Error(result.error);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateMarker = async (id: string, data: UpdateMarkerDTO) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await updateMarkerAction(id, data);
      
      if (result.success) {
        return result.data;
      } else {
        setError(result.error || 'Failed to update marker');
        throw new Error(result.error);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  const deleteMarker = async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await deleteMarkerAction(id);
      
      if (result.success) {
        return true;
      } else {
        setError(result.error || 'Failed to delete marker');
        throw new Error(result.error);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    createMarker,
    updateMarker,
    deleteMarker,
    isLoading,
    error,
  };
}

