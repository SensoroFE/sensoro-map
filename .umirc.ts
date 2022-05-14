import { join } from "path";

const logo =
  "https://cdn.jsdelivr.net/gh/wangxingkang/pictures@latest/imgs/amap-logo.svg";

export default {
  mode: "site",
  title: "Sensoro Map",
  favicon: logo,
  logo,
  resolve: {
    includes: ["docs"],
  },
  navs: [
    null,
    {
      title: "React-AMap",
      path: "https://react-amap-pansyjs.vercel.app/",
    },
    {
      title: "AMap",
      path: "https://lbs.amap.com/api/jsapi-v2/summary",
    },
  ],
  alias: {
    "@sensoro/sensoro-map/es": join(__dirname, "src/components"),
    "@sensoro/sensoro-map/lib": join(__dirname, "src"),
    "@sensoro/sensoro-map": join(__dirname, "src"),
  },
  dynamicImport: {},
  hash: true,
  nodeModulesTransform: {
    type: "none",
    exclude: [],
  },
  extraBabelPlugins: [
    [
      "import",
      {
        libraryName: "antd",
        libraryDirectory: "es",
        style: "css",
      },
    ],
    [
      "import",
      {
        libraryName: "@sensoro/sensoro-design",
        libraryDirectory: "es",
        style: true,
      },
      "@sensoro/sensoro-design",
    ],
  ],
  theme: {
    "@primary-color": "#2B6DE5",
  },
};
