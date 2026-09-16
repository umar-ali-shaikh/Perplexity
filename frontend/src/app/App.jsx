import { useEffect } from "react";
import { RouterProvider } from "react-router";
import { router } from "./app.routes";
import { useAuth } from "../features/auth/hooks/useAuth";
import "./App.css";

const App = () => {
  const { handlegetMe } = useAuth();

  useEffect(() => {
    handlegetMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <RouterProvider router={router} />;
};

export default App;
