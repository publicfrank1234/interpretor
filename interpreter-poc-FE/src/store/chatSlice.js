import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  history: [],
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addMessage(state, action) {
      state.history.push(action.payload);
    },
    clearHistory(state) {
      state.history = [];
    },
  },
});

export const { addMessage, clearHistory } = chatSlice.actions;
export default chatSlice.reducer;
