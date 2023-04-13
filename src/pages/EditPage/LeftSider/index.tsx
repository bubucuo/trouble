import classNames from "classnames";
import {memo, useState, useEffect} from "react";
import styles from "./index.module.less";
import TextSide from "./TextSide";

export const isTextComponent = 1;
export const isImgComponent = 2;
export const isGraphComponent = 3;

const LeftSider = memo(() => {
  const [showSide, setShowSide] = useState(0);

  const _setShowSide = (which: number | undefined) => {
    if (showSide === which) {
      setShowSide(0);
    } else {
      setShowSide(which || 0);
    }
  };

  useEffect(() => {
    const cancelShow = () => setShowSide(0);
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

      {showSide === isTextComponent && <TextSide />}
    </div>
  );
});

export default LeftSider;
