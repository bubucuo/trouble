import {defineConfig} from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/api": "http://template.josephxia.com",
    },
  },

  plugins: [tsconfigPaths(), react()],

  // resolve: {
  //   alias: {
  //     src: path.resolve(__dirname, "src/"),
  //   },
  // },

  css: {
    modules: {
      // generateScopedName: "[name]__[local]__hash:base64:5",
      hashPrefix: "prefix",
    },

    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        // math: "parens-division",
      },
      // modifyLessRule: function () {
      //   return {
      //     test: /\.less$/,
      //     exclude: /node_modules/,
      //     use: [
      //       {loader: "style-loader"},
      //       {
      //         loader: "css-loader",
      //         options: {
      //           modules: {
      //             localIdentName: "[local]_[hash:base64:6]",
      //           },
      //         },
      //       },
      //       {loader: "less-loader"},
      //     ],
      //   };
      // },
    },
  },
});
