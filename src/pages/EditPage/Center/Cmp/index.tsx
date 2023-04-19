import {ICmpWithKey} from "src/store/editStoreTypes";
import styles from "./index.module.less";
import {isImgComponent, isTextComponent} from "../../LeftSider";
import {Img, Text} from "./CmpDetail";

interface ICmpProps {
  cmp: ICmpWithKey;
  index: number;
}

export default function Cmp(props: ICmpProps) {
  const {cmp, index} = props;
  const {style} = cmp;

  return (
    <div className={styles.main} style={{...style, zIndex: index}}>
      {cmp.type === isTextComponent && <Text {...cmp} />}
      {cmp.type === isImgComponent && <Img {...cmp} />}
    </div>
  );
}
