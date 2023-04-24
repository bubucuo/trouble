import ReactDOM from "react-dom/client";
import App from "./App";
import "antd/dist/reset.css";
import "./index.css";

// 如果在immer中使用Map/Set，则在你的应用程序入口文件
import {enableMapSet} from "immer";

enableMapSet();
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <App />
);
