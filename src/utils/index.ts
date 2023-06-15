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
