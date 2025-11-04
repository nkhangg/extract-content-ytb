import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Fragment } from "react";
import { Link, useLocation } from "react-router";
import { Links, type IMenu } from "@/config/links";

// Hàm tìm đường dẫn trong cây
function findPath(
  tree: IMenu[],
  path: string,
  parents: IMenu[] = []
): IMenu[] | null {
  for (const node of tree) {
    if (node.url === path) {
      return [...parents, node];
    }
    if (node.items) {
      const result = findPath(node.items, path, [...parents, node]);
      if (result) return result;
    }
  }
  return null;
}

export function AppBreadcrumb() {
  const location = useLocation();
  const crumbs = findPath([], location.pathname) || [];

  if (crumbs.length === 0) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((c, idx) => (
          <Fragment key={c.url}>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={c.url}>{c.title}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {idx < crumbs.length - 1 && <BreadcrumbSeparator />}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
