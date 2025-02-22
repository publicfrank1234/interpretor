import { configureStore } from "@reduxjs/toolkit";
import chatReducer from "./chatSlice";
import configReducer from "./configSlice";

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    config: configReducer,
  },
});
