import { type PageData, type SiteData, resolvePageKey } from "@vuepress/core";
import { vi as _vi } from "vitest";
import { h, ref } from "vue";
import {
  type RouteLocation,
  type RouteLocationNormalizedLoaded,
  type RouteRecordRaw,
  type Router,
  createRouter,
  createWebHistory,
} from "vue-router";

export type MockPageOptions = Partial<PageData>;
export type MockSiteOptions = Partial<SiteData>;

export type MockRoute = Partial<RouteLocation> & Record<string, unknown>;
export type MockRouteRecord = Partial<RouteRecordRaw> &
  Pick<RouteRecordRaw, "path">;

export type MockGlobalOption = [name: string, value: unknown];

export interface MockOptions {
  /**
   * Current path
   */
  path?: string;
  page?: MockPageOptions;
  site?: MockSiteOptions;
  route?: MockRoute;
  routes?: MockRouteRecord[];
  /**
   * @default false
   */
  dev?: boolean;

  /**
   * @default true
   */
  ssr?: boolean;

  globals?: MockGlobalOption[];
}

const getRouteRecord = ({ path, ...route }: MockRouteRecord): RouteRecordRaw =>
  <RouteRecordRaw>{
    name: resolvePageKey({ path }),
    path,
    component: () => null,
    ...route,
  };

export const setup = (
  vi: typeof _vi,
  {
    path = "/test",
    page = {},
    site = {},
    route = {},
    routes = [],
    dev = false,
    ssr = true,
    globals = [],
  }: MockOptions = {}
): Record<string, () => unknown> => {
  vi.stubGlobal("__VUEPRESS_BASE__", site.base ?? "/");
  vi.stubGlobal("__VUEPRESS_DEV__", dev);
  vi.stubGlobal("__VUEPRESS_SSR__", ssr);

  globals.forEach(([name, value]) => {
    vi.stubGlobal(name, value);
  });

  return {
    "@vuepress/client": () => {
      const pageDataMock: PageData = {
        path,
        title: "Test",
        frontmatter: {},
        lang: "en-US",
        headers: [],
        ...page,
        key: resolvePageKey({ path }),
      };
      const siteDataMock: SiteData = {
        title: "Test",
        description: "description",
        lang: "en-US",
        base: "/",
        head: [],
        ...site,
        locales: {
          ...site?.locales,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          "/": {
            title: "Test",
            description: "description",
            lang: "en-US",
            ...site?.locales?.["/"],
          },
        },
      };

      return {
        usePageData: () => ref(pageDataMock),
        useRouteLocale: () => ref("/"),
        useSiteData: () => ref(siteDataMock),
      };
    },

    "vue-router": () => {
      const mockRoute: RouteLocation = {
        name: resolvePageKey({ path }),
        path,
        hash: "",
        fullPath: path,
        matched: [],
        query: {},
        redirectedFrom: undefined,
        params: {},
        meta: {},
        ...route,
      };

      const router = createRouter({
        history: createWebHistory(),
        routes: [
          getRouteRecord(<RouteRecordRaw>{ path, ...route }),
          ...routes.map((item) => getRouteRecord(item)),
        ],
      });

      return {
        useRouter: (): Router => router,
        useRoute: (): RouteLocationNormalizedLoaded => mockRoute,
        RouterLink: (attrs: Record<string, unknown>) => h("router-link", attrs),
      };
    },
  };
};

export const resetSetup = (vi: typeof _vi): void => {
  vi.unstubAllGlobals();
  vi.resetModules();
  vi.resetAllMocks();
};
