import React from "react";
import styles from "./index.module.less";
import Canvas from "./Canvas";

export default function Center() {
  return (
    <div id="center" className={styles.main} tabIndex={0}>
      <Canvas />
    </div>
  );
}
