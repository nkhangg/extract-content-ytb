import { type RouteConfig, index, layout } from "@react-router/dev/routes";

export default [
  layout("layouts/app-layout.tsx", [
    layout("layouts/private-layout.tsx", [index("pages/dashboard.tsx")]),
  ]),
] satisfies RouteConfig;
