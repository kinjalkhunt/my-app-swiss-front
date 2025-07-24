import React from "react";

const Login = React.lazy(() => import("./src/Components/Pages/Auth/Login"))
const FabricEntry = React.lazy(() => import("./src/Components/Pages/FabricEntry"));
export const router = [
  {
    path: "/",
    name: "login",
    element: Login,
    // exact: true
  },
  {
    path: "/fabric-entry",
    name: "fabric-entry",
    element: FabricEntry
  }

];