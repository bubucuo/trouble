import {useSearchParams} from "react-router-dom";
import {isString} from "lodash";

// 获取画布唯一标识id
export function useCanvasId(): number | null {
  const [params] = useSearchParams();
  let id: any = params.get("id");

  if (isString(id)) {
    id = parseInt(id);
  }

  return id;
}

// 页面 或者 模板，如果为空，则认为是模板
export function useCanvasType() {
  const [params] = useSearchParams();
  let type = params.get("type");

  return type || "content";
}
