import { configureStore } from '@reduxjs/toolkit';
import { useSelector, useDispatch } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import authReducer from '@/store/authSlice';
import uploadReducer from '@/store/uploadSlice';
import extractionReducer from '@/store/extractionSlice';
import uiReducer from '@/store/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    upload: uploadReducer,
    extraction: extractionReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['upload/addFile'],
        ignoredPaths: ['upload.files'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch: () => AppDispatch = () => useDispatch<AppDispatch>();