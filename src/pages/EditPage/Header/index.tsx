import classNames from "classnames";
import styles from "./index.module.less";
import {useNavigate} from "react-router-dom";
import {Link} from "react-router-dom";
import useEditStore, {IEditStore} from "src/store/editStore";
import {useCanvasId} from "src/store/hooks";
import {useEditStoreCanvas} from "src/store/editHooks";
import {saveCanvas} from "src/request/canvas";

export default function Header() {
  const editStore = useEditStore() as IEditStore;
  const canvas = useEditStoreCanvas();
  const navigate = useNavigate();

  const id = useCanvasId();

  const save = () => {
    saveCanvas(
      {
        id,
        content: JSON.stringify(canvas),
        title: canvas.title,
        type: "template",
      },
      (res: any) => {
        alert("保存成功");
        if (id == null) {
          navigate("?id=" + res.id);
        }
      }
    );
  };

  const emptyCanvas = () => {
    editStore.setCanvas(null);
  };

  const goPrevCanvasHistory = () => {
    editStore.goPrevCanvasHistory();
  };

  const goNextCanvasHistory = () => {
    editStore.goNextCanvasHistory();
  };

  return (
    <div className={styles.main}>
      <div className={classNames(styles.item)}>
        <Link to="/">首页</Link>
      </div>

      <div className={classNames(styles.item)} onClick={save}>
        <span
          className={classNames("iconfont icon-baocun", styles.icon)}></span>
        <span className={styles.txt}>保存</span>
      </div>

      <div className={classNames(styles.item)} onClick={goPrevCanvasHistory}>
        <span
          className={classNames(
            "iconfont icon-chexiaofanhuichehuishangyibu",
            styles.icon
          )}></span>
        <span className={styles.txt}>上一步</span>
      </div>

      <div className={classNames(styles.item)} onClick={goNextCanvasHistory}>
        <span
          className={classNames(
            "iconfont icon-chexiaofanhuichehuishangyibu",
            styles.icon
          )}
          style={{transform: `rotateY{180}deg`}}></span>
        <span className={styles.txt}>下一步</span>
      </div>

      <div className={classNames(styles.item)} onClick={emptyCanvas}>
        <span
          className={classNames("iconfont icon-qingkong", styles.icon)}></span>
        <span className={styles.txt}>清空</span>
      </div>

      {/* <div className={classNames(styles.item)} onClick={save}>
        <span className={classNames("iconfont icon-fabu", styles.icon)}></span>
        <span className={styles.txt}>发布</span>
      </div> */}
    </div>
  );
}
