import {useFetchCanvas} from "src/store/editStoreHooks";
import Header from "./Header";
import styles from "./index.module.less";
import Left from "./Left";
import Center from "./Center";
import Right from "./Right";

export default function Edit() {
  useFetchCanvas();

  console.log("Edit render"); //sy-log
  return (
    <div className={styles.main}>
      <Header />
      <div className={styles.content}>
        <Left />
        <Center />
        <Right />
        {/* <Right /> */}
      </div>
    </div>
  );
}
