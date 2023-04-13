import {common, myAxios} from "./index";
// 查询页面列表
export function getCanvasList(
  values: any,
  successCallback: Function,
  failedCallback?: Function
) {
  myAxios.get("/api/web/content/list?pageSize=1000" + values).then((res) => {
    common(res, successCallback, failedCallback);
  });
}

// 查询模板列表
export function getTemplateList(
  values: any,
  successCallback: Function,
  failedCallback?: Function
) {
  myAxios.get("/api/web/template/list?pageSize=1000" + values).then((res) => {
    common(res, successCallback, failedCallback);
  });
}

// 删除
export function deleteCanvas(
  values: {id: number},
  successCallback: Function,
  failedCallback?: Function
) {
  myAxios.post("/api/web/content/delete", values).then((res) => {
    common(res, successCallback);
  });
}
