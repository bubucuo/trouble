import {useFetchCanvas} from "src/store/editHooks";
import Header from "./Header";
import styles from "./index.module.less";
import Left from "./Left";
import Center from "./Center";
import Right from "./Right";

export default function Edit() {
  useFetchCanvas();

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
