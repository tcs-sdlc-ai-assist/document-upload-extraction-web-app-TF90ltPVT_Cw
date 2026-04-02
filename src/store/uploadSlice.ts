import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { UploadState, FileUploadItem } from '@/types';

const initialState: UploadState = {
  files: [],
  overallStatus: 'idle',
};

const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
    addFile(state, action: PayloadAction<{ file: File; fileName: string; fileType: FileUploadItem['fileType']; fileSize: number }>) {
      const newItem: FileUploadItem = {
        id: crypto.randomUUID(),
        file: action.payload.file,
        fileName: action.payload.fileName,
        fileType: action.payload.fileType,
        fileSize: action.payload.fileSize,
        status: 'idle',
        progress: 0,
        validationError: null,
      };
      state.files.push(newItem);
    },
    updateProgress(state, action: PayloadAction<{ id: string; progress: number }>) {
      const file = state.files.find((f) => f.id === action.payload.id);
      if (file) {
        file.progress = action.payload.progress;
      }
    },
    setFileStatus(state, action: PayloadAction<{ id: string; status: FileUploadItem['status'] }>) {
      const file = state.files.find((f) => f.id === action.payload.id);
      if (file) {
        file.status = action.payload.status;
      }
    },
    setValidationError(state, action: PayloadAction<{ id: string; error: string }>) {
      const file = state.files.find((f) => f.id === action.payload.id);
      if (file) {
        file.validationError = action.payload.error;
        file.status = 'error';
      }
    },
    removeFile(state, action: PayloadAction<{ id: string }>) {
      state.files = state.files.filter((f) => f.id !== action.payload.id);
    },
    resetUploads() {
      return initialState;
    },
  },
});

export const {
  addFile,
  updateProgress,
  setFileStatus,
  setValidationError,
  removeFile,
  resetUploads,
} = uploadSlice.actions;

export default uploadSlice.reducer;