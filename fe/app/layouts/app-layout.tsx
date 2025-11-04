import { Outlet } from "react-router";

export interface IAppLayoutProps {}

export default function AppLayout(props: IAppLayoutProps) {
  return (
    <div>
      <Outlet />
    </div>
  );
}
