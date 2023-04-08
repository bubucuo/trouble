import {Suspense, useEffect} from "react";
import useEditStore from "src/store/editStore";
import {useFetchCanvas} from "src/store/editHooks";
import Header from "./Header";
import styles from "./index.module.less";
import Left from "./Left";
import Center from "./Center";
import Right from "./Right";

export default function Edit() {
  const {canvas, fetchCanvas} = useEditStore();

  // console.log(
  //   "%c [  ]-7",
  //   "font-size:13px; background:pink; color:#bf2c9f;",
  //   store
  // );

  console.log(
    "%c [  ]-15",
    "font-size:13px; background:pink; color:#bf2c9f;",
    canvas
  );

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
