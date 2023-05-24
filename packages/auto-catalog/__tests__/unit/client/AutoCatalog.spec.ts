/* eslint-disable @typescript-eslint/naming-convention */
import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { type MockGlobalOption, resetSetup, setup } from "vuepress-test-utils";

import { locales } from "../../../src/node/locales.js";

const mockRoutes = [
  {
    path: "/",
    meta: {
      title: "Home",
    },
  },
  ...["a", "b", "c"]
    .map((item) => ({
      path: `/${item}.html`,
      meta: {
        title: `Title ${item.toUpperCase()}`,
      },
    }))
    .flat(1),
  ...["a", "b", "c"]
    .map((item1) =>
      ["a", "b", "c"].map((item2) => ({
        path: `/${item1}/${item2}.html`,
        meta: {
          title: `Title ${item1.toUpperCase()}-${item2.toUpperCase()}`,
        },
      }))
    )
    .flat(2),
  ...["a", "b", "c"]
    .map((item1) =>
      ["a", "b", "c"].map((item2) =>
        ["a", "b", "c"].map((item3) => ({
          path: `/${item1}/${item2}/${item3}.html`,
          meta: {
            title: `Title ${item1.toUpperCase()}-${item2.toUpperCase()}-${item3.toUpperCase()}`,
          },
        }))
      )
    )
    .flat(3),
];

const globals: MockGlobalOption[] = [
  ["AUTO_CATALOG_LOCALES", { "/": locales["/en/"] }],
  ["AUTO_CATALOG_INDEX_META_KEY", "index"],
  ["AUTO_CATALOG_TITLE_META_KEY", "title"],
  ["AUTO_CATALOG_ICON_META_KEY", "icon"],
  ["AUTO_CATALOG_ORDER_META_KEY", "order"],
];

describe("AutoCatalog", () => {
  it("should render empty hint", async () => {
    const mocks = setup(vi, {
      globals,
    });

    Object.entries(mocks).forEach(([module, factory]) => {
      vi.doMock(module, factory);
    });

    const AutoCatalog = (
      await import("../../../src/client/components/AutoCatalog.js")
    ).default;

    const wrapper = mount(AutoCatalog);

    expect(wrapper.html()).toMatchSnapshot();

    resetSetup(vi);
  });

  it("should render catalog with level2", async () => {
    const mocks = setup(vi, {
      routes: mockRoutes,
      globals,
    });

    Object.entries(mocks).forEach(([module, factory]) => {
      vi.doMock(module, factory);
    });

    const AutoCatalog = (
      await import("../../../src/client/components/AutoCatalog.js")
    ).default;

    const wrapper = mount(AutoCatalog);

    expect(wrapper.html()).toMatchSnapshot();

    resetSetup(vi);
  });
});
