import { createSlice } from "@reduxjs/toolkit";

const configSlice = createSlice({
  name: "config",
  initialState: {
    apiKey: "",
  },
  reducers: {
    setApiKey: (state, action) => {
      state.apiKey = action.payload;
    },
  },
});

export const { setApiKey } = configSlice.actions;
export default configSlice.reducer;
