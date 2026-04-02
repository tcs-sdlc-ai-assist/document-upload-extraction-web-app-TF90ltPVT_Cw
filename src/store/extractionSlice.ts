import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ExtractionState, ExtractionResultData } from '@/types';

const initialState: ExtractionState = {
  results: {},
  status: 'idle',
  successCount: 0,
  failureCount: 0,
};

const extractionSlice = createSlice({
  name: 'extraction',
  initialState,
  reducers: {
    startExtraction(state) {
      state.status = 'processing';
    },
    addExtractionResult(state, action: PayloadAction<ExtractionResultData>) {
      const result = action.payload;
      state.results[result.fileId] = result;

      if (result.status === 'completed') {
        state.successCount++;
      } else if (result.status === 'failed') {
        state.failureCount++;
      }
    },
    setExtractionComplete(state) {
      state.status = 'completed';
    },
    setExtractionError(state) {
      state.status = 'error';
    },
    resetExtraction() {
      return initialState;
    },
  },
});

export const {
  startExtraction,
  addExtractionResult,
  setExtractionComplete,
  setExtractionError,
  resetExtraction,
} = extractionSlice.actions;

export default extractionSlice.reducer;