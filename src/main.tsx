import ReactDOM from "react-dom/client";
import App from "./App";
import "antd/dist/reset.css";
import "./index.css";
// 在你的应用程序入口文件
import {enableMapSet} from "immer";

enableMapSet();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <App />
);
