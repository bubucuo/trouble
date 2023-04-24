import {ICmpWithKey} from "src/store/editStoreTypes";
import styles from "./index.module.less";
import {isImgComponent, isTextComponent} from "../../LeftSider";
import {Img, Text} from "./CmpDetail";
import classNames from "classnames";
import {omit, pick} from "lodash";
import {setCmpSelected, setCmpsSelected} from "src/store/editStore";
import {memo} from "react";

interface ICmpProps {
  cmp: ICmpWithKey;
  index: number;
  isSelected: boolean;
}

const Cmp = memo((props: ICmpProps) => {
  const {cmp, index, isSelected} = props;
  const {style} = cmp;

  const setSelected = (e) => {
    if (e.metaKey) {
      setCmpsSelected([index]);
    } else {
      setCmpSelected(index);
    }
  };

  const outerStyle = pick(style, [
    "position",
    "top",
    "left",
    "width",
    "height",
  ]);

  const innerStyle = omit(style, "position", "top", "left");

  console.log("cmp render"); //sy-log

  return (
    <div
      className={classNames(styles.main, isSelected && "selectedBorder")}
      style={outerStyle}
      onClick={setSelected}>
      <div className={styles.inner} style={{...innerStyle, zIndex: index}}>
        {cmp.type === isTextComponent && <Text {...cmp} />}
        {cmp.type === isImgComponent && <Img {...cmp} />}
      </div>
    </div>
  );
});

export default Cmp;
