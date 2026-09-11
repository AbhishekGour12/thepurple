import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    pageLoading: false,
    pageLoadingLabel: '',
    buttonLoading: {},
    customerHydrated: false,
  },
  reducers: {
    setCustomerHydrated(state, action) {
      state.customerHydrated = action.payload;
    },
    setPageLoading(state, action) {
      if (typeof action.payload === 'boolean') {
        state.pageLoading = action.payload;
        if (!action.payload) state.pageLoadingLabel = '';
        return;
      }
      state.pageLoading = Boolean(action.payload?.active);
      state.pageLoadingLabel = action.payload?.label || '';
    },
    setButtonLoading(state, action) {
      const { key, active } = action.payload;
      state.buttonLoading[key] = active;
    },
  },
});

export const { setCustomerHydrated, setPageLoading, setButtonLoading } = uiSlice.actions;
export default uiSlice.reducer;
