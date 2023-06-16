import {ICmpWithKey} from "src/store/editStoreTypes";

export function getOnlyKey() {
  return Math.ceil(Math.random() * 1000000000) + "";
}

export function isCmpInView(cmp: ICmpWithKey) {
  const element = document.getElementById("cmp" + cmp.key) as HTMLElement;

  const viewWidth = window.innerWidth || document.documentElement.clientWidth;
  const viewHeight =
    window.innerHeight || document.documentElement.clientHeight;
  const {top, right, bottom, left} = element.getBoundingClientRect();

  return top >= 0 && left >= 0 && right <= viewWidth && bottom <= viewHeight;
}

// 给定选中组件，计算出外层包含它们的最小矩形，即决定位置和宽高的四个属性
export function computeBoxStyle(
  cmps: Array<ICmpWithKey>,
  assembly: Set<number>
): {top: number; left: number; width: number; height: number} {
  let top = 999999,
    left = 999999,
    bottom = -999999,
    right = -999999;

  // 如果选中的是一个组合组件的子组件，那么它的位置要通过它的父级来计算

  assembly.forEach((index) => {
    const cmp = cmps[index];

    top = Math.min(top, cmp.style.top);
    left = Math.min(left, cmp.style.left);

    bottom = Math.max(bottom, cmp.style.top + cmp.style.height);
    right = Math.max(right, cmp.style.left + cmp.style.width);
  });

  let width = right - left;
  let height = bottom - top;
  return {top, left, width, height};
}
