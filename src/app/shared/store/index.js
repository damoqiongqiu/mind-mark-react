import { configureStore } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import sessionReducer from '../session';

/**
 * 全局 Redux Store
 */

const selectedFilesSlice = createSlice({
  name: 'selectedFiles',
  initialState: {
    value: [],
  },
  reducers: {
    setSelectedFiles: (state, action) => {
      state.value = action.payload;
    },
  },
});
export const { setSelectedFiles } = selectedFilesSlice.actions;

const uploadedFileSlice = createSlice({
  name: 'uploadedFile',
  initialState: {
    value: null
  },
  reducers: {
    setUploadedFile: (state, action) => {
      state.value = action.payload;
    }
  }
});
export const { setUploadedFile } = uploadedFileSlice.actions;


export default configureStore({
  reducer: {
    session: sessionReducer,
    selectedFiles: selectedFilesSlice.reducer,
    uploadedFile: uploadedFileSlice.reducer
  },
})