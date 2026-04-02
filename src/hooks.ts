import { useState, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/store';
import { signupThunk, loginThunk, logoutThunk } from '@/store/authSlice';
import {
  addFile as addFileAction,
  updateProgress as updateProgressAction,
  removeFile as removeFileAction,
  resetUploads as resetUploadsAction,
  setFileStatus,
} from '@/store/uploadSlice';
import {
  startExtraction,
  addExtractionResult,
  setExtractionComplete,
  setExtractionError,
  resetExtraction as resetExtractionAction,
} from '@/store/extractionSlice';
import { extractFile } from '@/services/extractionEngine';
import {
  logAction as logActionUtil,
  logError as logErrorUtil,
  getLogs,
  clearLogs as clearLogsUtil,
} from '@/utils/logger';
import type { FileUploadItem, LogEntry } from '@/types';

export function useAuth() {
  const dispatch = useAppDispatch();
  const { currentUser, isAuthenticated, error, loading } = useAppSelector((state) => state.auth);

  const login = useCallback(
    (username: string, password: string) => {
      return dispatch(loginThunk({ username, password }));
    },
    [dispatch]
  );

  const signup = useCallback(
    (username: string, password: string) => {
      return dispatch(signupThunk({ username, password }));
    },
    [dispatch]
  );

  const logout = useCallback(() => {
    return dispatch(logoutThunk());
  }, [dispatch]);

  return {
    currentUser,
    isAuthenticated,
    error,
    loading,
    login,
    signup,
    logout,
  };
}

export function useUpload() {
  const dispatch = useAppDispatch();
  const { files, overallStatus } = useAppSelector((state) => state.upload);

  const addFile = useCallback(
    (file: File, fileName: string, fileType: FileUploadItem['fileType'], fileSize: number) => {
      dispatch(addFileAction({ file, fileName, fileType, fileSize }));
    },
    [dispatch]
  );

  const updateProgress = useCallback(
    (id: string, progress: number) => {
      dispatch(updateProgressAction({ id, progress }));
    },
    [dispatch]
  );

  const removeFile = useCallback(
    (id: string) => {
      dispatch(removeFileAction({ id }));
    },
    [dispatch]
  );

  const resetUploads = useCallback(() => {
    dispatch(resetUploadsAction());
  }, [dispatch]);

  return {
    files,
    overallStatus,
    addFile,
    updateProgress,
    removeFile,
    resetUploads,
  };
}

export function useExtraction() {
  const dispatch = useAppDispatch();
  const { results, status, successCount, failureCount } = useAppSelector((state) => state.extraction);

  const processFile = useCallback(
    async (file: File) => {
      dispatch(startExtraction());

      try {
        const result = await extractFile(file);
        dispatch(addExtractionResult(result));
        dispatch(setExtractionComplete());
        return result;
      } catch {
        dispatch(setExtractionError());
        return null;
      }
    },
    [dispatch]
  );

  const resetExtraction = useCallback(() => {
    dispatch(resetExtractionAction());
  }, [dispatch]);

  return {
    results,
    status,
    successCount,
    failureCount,
    processFile,
    resetExtraction,
  };
}

export function useLogger() {
  const [logs, setLogs] = useState<LogEntry[]>(() => getLogs());

  const refreshLogs = useCallback(() => {
    setLogs(getLogs());
  }, []);

  const logAction = useCallback(
    (actionType: string, context: Record<string, unknown> = {}) => {
      logActionUtil(actionType, context);
      refreshLogs();
    },
    [refreshLogs]
  );

  const logError = useCallback(
    (actionType: string, context: Record<string, unknown> = {}) => {
      logErrorUtil(actionType, context);
      refreshLogs();
    },
    [refreshLogs]
  );

  const clearLogs = useCallback(() => {
    clearLogsUtil();
    refreshLogs();
  }, [refreshLogs]);

  return {
    logs,
    logAction,
    logError,
    clearLogs,
    refreshLogs,
  };
}