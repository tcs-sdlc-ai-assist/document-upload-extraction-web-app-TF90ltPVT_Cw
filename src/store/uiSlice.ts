import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { UIState, Notification } from '@/types';

const initialState: UIState = {
  activeTab: 'upload',
  sidebarOpen: false,
  debugPanelOpen: false,
  notifications: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveTab(state, action: PayloadAction<string>) {
      state.activeTab = action.payload;
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    toggleDebugPanel(state) {
      state.debugPanelOpen = !state.debugPanelOpen;
    },
    addNotification(state, action: PayloadAction<{ id: string; message: string; type: Notification['type'] }>) {
      const notification: Notification = {
        id: action.payload.id,
        message: action.payload.message,
        type: action.payload.type,
        timestamp: new Date().toISOString(),
      };
      state.notifications.push(notification);
    },
    removeNotification(state, action: PayloadAction<{ id: string }>) {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload.id);
    },
    clearNotifications(state) {
      state.notifications = [];
    },
  },
});

export const {
  setActiveTab,
  toggleSidebar,
  toggleDebugPanel,
  addNotification,
  removeNotification,
  clearNotifications,
} = uiSlice.actions;

export default uiSlice.reducer;