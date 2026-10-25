"use client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { ToastContainer } from "react-toastify";
import store, { persistor } from "@/lib/redux/store";
import useSyncAuth from "@/hooks/useSyncAuth";
import "react-toastify/dist/ReactToastify.css";

function AuthBootstrap() {
  useSyncAuth();
  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AuthBootstrap />
        <ToastContainer position="top-right" autoClose={3000} />
        {children}
      </PersistGate>
    </Provider>
  );
}
