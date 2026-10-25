import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice";
import orderSlice from "./orderSlice";
import cartSlice from "./cartSlice";
import posSlice from "./posSlice";

import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";

const createNoopStorage = () => ({
  getItem: async () => null,
  setItem: async (_key: string, value: string) => value,
  removeItem: async () => undefined,
});

const storage =
  typeof window === "undefined"
    ? createNoopStorage()
    : createWebStorage("local");

const orderPersistConfig = {
  key: "order",
  version: 1,
  storage,
  blacklist: ["phoneNumber", "deliveryAddress"],
};

const cartPersistConfig = {
  key: "cart",
  version: 1,
  storage,
};

// ✅ You can also add a persist config for posSlice if needed
// Example (if some parts of pos should be excluded):
// const posPersistConfig = {
//   key: "pos",
//   version: 1,
//   storage,
//   blacklist: ["temporaryData"],
// };

const persistedOrderReducer = persistReducer(orderPersistConfig, orderSlice);
const persistedCartReducer = persistReducer(cartPersistConfig, cartSlice);

const rootReducer = combineReducers({
  auth: authSlice,
  order: persistedOrderReducer,
  cart: persistedCartReducer,
  pos: posSlice, // Use persistedPosReducer if using persist
});

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
