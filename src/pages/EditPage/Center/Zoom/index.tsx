import classNames from "classnames";
import styles from "./index.module.less";
import useZoomStore from "src/store/zoomStore";
import {useState} from "react";

export default function Zoom() {
  const {
    zoom,
    zoomIn,
    zoomOut,
    setZoom,
    addReferenceLineX,
    addReferenceLineY,
    clearReferenceLine,
  } = useZoomStore();
  const [showReferenceLine, setShowReferenceLine] = useState(false);
  return (
    <div className={styles.main}>
      <ul className={styles.zoom}>
        <li
          className={classNames(styles.icon)}
          style={{cursor: "zoom-in"}}
          onClick={zoomOut}>
          +
        </li>
        <li className={classNames(styles.num)}>
          <input
            type="num"
            value={zoom}
            onChange={(e: any) => {
              setZoom(e.target.value);
            }}
          />
          %
        </li>
        <li
          className={classNames(styles.icon)}
          style={{cursor: "zoom-out"}}
          onClick={zoomIn}>
          -
        </li>
        <li
          onClick={() => {
            setShowReferenceLine(!showReferenceLine);
          }}>
          参考线
        </li>
      </ul>

      {showReferenceLine && (
        <ul
          className={styles.referenceLine}
          onMouseLeave={() => {
            setShowReferenceLine(!showReferenceLine);
          }}>
          <li
            onClick={() => {
              addReferenceLineX();
            }}>
            横向参考线
          </li>
          <li
            onClick={() => {
              addReferenceLineY();
            }}>
            竖向参考线
          </li>
          <li
            onClick={() => {
              clearReferenceLine();
            }}>
            删除参考线
          </li>
        </ul>
      )}
    </div>
  );
}
