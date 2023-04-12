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

// 获取页面类型，普通页面还是模板
export function useCanvasType(): string {
  const [params] = useSearchParams();
  let type: string | null = params.get("type");

  return type || "content";
}
