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
import storage from "redux-persist/lib/storage";

// Persist configuration for order
const orderPersistConfig = {
  key: "order",
  version: 1,
  storage,
  blacklist: ["items"],
};

// Persist configuration for cart
const cartPersistConfig = {
  key: "cart",
  version: 1,
  storage,
  blacklist: ["items", "subtotal", "totalItems"],
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
