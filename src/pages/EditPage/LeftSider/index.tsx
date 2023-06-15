import classNames from "classnames";
import {memo, useState, useEffect} from "react";
import styles from "./index.module.less";
import TextSider from "./TextSider";
import ImgSider from "./ImgSider";
import GraphSider from "./GraphSider";
import TplSider from "./TplSider";
import {
  isTextComponent,
  isImgComponent,
  isFormComponent,
  isGraphComponent,
} from "src/utils/const";

export const isTplSide = 0b00000000; // 0

const LeftSider = memo(() => {
  const [showSide, setShowSide] = useState(-1);

  const _setShowSide = (which: number | undefined) => {
    if (showSide === which) {
      setShowSide(0);
    } else {
      setShowSide(which || 0);
    }
  };

  useEffect(() => {
    const cancelShow = () => setShowSide(-1);
    document.getElementById("center")?.addEventListener("click", cancelShow);
    return () => {
      document
        .getElementById("center")
        ?.removeEventListener("click", cancelShow);
    };
  }, []);

  console.log("left render"); //sy-log

  return (
    <div className={styles.main}>
      <ul className={styles.cmps}>
        <li
          className={classNames(
            styles.cmp,
            showSide === isTplSide ? styles.selected : ""
          )}
          onClick={() => _setShowSide(isTplSide)}>
          <i
            className={classNames(
              "iconfont icon-mobankuangjia-xianxing",
              styles.cmpIcon
            )}
          />
          <span className={styles.cmpText}>模板</span>
        </li>

        <li
          className={classNames(
            styles.cmp,
            showSide === isTextComponent ? styles.selected : ""
          )}
          onClick={() => _setShowSide(isTextComponent)}>
          <i className={classNames("iconfont icon-wenben", styles.cmpIcon)} />
          <span className={styles.cmpText}>文本</span>
        </li>
        <li
          className={classNames(
            styles.cmp,
            showSide === isImgComponent ? styles.selected : ""
          )}
          onClick={() => _setShowSide(isImgComponent)}>
          <i className={classNames("iconfont icon-tupian", styles.cmpIcon)} />
          <span className={styles.cmpText}>图片</span>
        </li>
        <li
          className={classNames(
            styles.cmp,
            showSide === isGraphComponent ? styles.selected : ""
          )}
          onClick={() => _setShowSide(isGraphComponent)}>
          <i
            className={classNames("iconfont icon-graphical", styles.cmpIcon)}
          />
          <span className={styles.cmpText}>图形</span>
        </li>
      </ul>

      {showSide === isTplSide && <TplSider />}
      {showSide === isTextComponent && <TextSider />}
      {showSide === isImgComponent && <ImgSider />}
      {showSide === isGraphComponent && <GraphSider />}
    </div>
  );
});

export default LeftSider;
