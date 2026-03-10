import { configureStore } from "@reduxjs/toolkit";
import type { Action, ThunkAction } from "@reduxjs/toolkit";
import formBuilderReducer from "./form-builder-slice";

export const store = configureStore({
  reducer: {
    formBuilder: formBuilderReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

export function createTestStore() {
  return configureStore({
    reducer: { formBuilder: formBuilderReducer },
  });
}
