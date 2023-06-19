import {Style} from "src/store/editStoreTypes";
import styles from "./index.module.less";

export default function Item({
  label,
  children,
  tips,
  labelStyle = {},
}: {
  label: string;
  children: JSX.Element;
  tips?: string;
  labelStyle?: Style;
}) {
  return (
    <div className={styles.main}>
      <label style={labelStyle}>{label}</label>
      {children}
      <p className={styles.tips}>{tips}</p>
    </div>
  );
}
