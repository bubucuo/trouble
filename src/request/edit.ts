import axios from "axios";
import {common, end, myAxios} from "./index";

// 查询, 没有设置登录权限
export function getCanvas(
  values: number, //id
  successCallback: Function,
  failedCallback?: Function
) {
  axios.get(end + "/api/web/content/get?id=" + values).then((res) => {
    common(res, successCallback);
  });
}

// 保存
export function saveCanvas(
  values: {id?: number | null; content: string; type?: string; title?: string},
  successCallback: Function,
  failedCallback?: Function
) {
  myAxios.post(end + "/api/web/content/save", values).then((res) => {
    common(res, successCallback);
  });
}
