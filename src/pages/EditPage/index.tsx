import {useFetchCanvas} from "src/store/editStoreHooks";
import Header from "./Header";
import styles from "./index.module.less";
import Left from "./Left";
import Center from "./Center";
import Right from "./Right";
import {useEffect} from "react";

export default function Edit() {
  useFetchCanvas();

  useEffect(() => {
    window.oncontextmenu = function (e) {
      //禁止右键
      e.preventDefault();
    };
  }, []);

  console.log("Edit render"); //sy-log
  return (
    <div className={styles.main}>
      <Header />
      <div className={styles.content}>
        <Left />
        <Center />
        <Right />
      </div>
    </div>
  );
}
