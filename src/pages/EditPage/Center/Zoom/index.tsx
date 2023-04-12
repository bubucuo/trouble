import classNames from "classnames";
import styles from "./index.module.less";
import useZoomStore from "./zoomStore";

export default function Zoom() {
  const {zoom, zoomIn, zoomOut, setZoom} = useZoomStore();
  return (
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
    </ul>
  );
}
