import React from "react";
import Img from "../Img";
import Lines from "../EditLine/Lines";
import type {ICmpWithKey} from "src/store/editStoreTypes";

import styles from "./index.module.less";
import {isImgComponent, isTextComponent} from "../../Left";
import useEditStore, {selectedCmpIndexSelector} from "src/store/editStore";
import Text from "../Text";

interface ICmpProps {
  cmp: ICmpWithKey;
  index: number;
}

export default function Cmp(props: ICmpProps) {
  const editStore = useEditStore();
  const {cmp, index} = props;
  const {style} = cmp;

  const {width, height} = style;
  const transform = `rotate(${style.transform}deg)`;

  const zIndex = index;

  const belongingToAssembly = editStore.belongingToAssembly(index);

  const innerWidth =
    (style.width as number) - (style.borderWidth as number) * 2;
  const innerHeight =
    (style.height as number) - (style.borderWidth as number) * 2;

  const selectedIndex = selectedCmpIndexSelector(editStore);

  const setSelected = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.metaKey) {
      // 把选中的组件填入组件集合
      editStore.addAndUpdateAssembly([index]);
    } else {
      editStore.setSelectedCmpIndex(index);
    }
  };

  console.log(
    "%c [  ]-45",
    "font-size:13px; background:pink; color:#bf2c9f;",
    cmp
  );

  return (
    <div
      className={styles.main}
      style={{
        ...style,
        transform,
        zIndex,
      }}
      onClick={setSelected}>
      {selectedIndex !== index && belongingToAssembly && (
        <Lines
          style={{width, height, transform}}
          basePos={style.borderWidth as number}
        />
      )}

      {/* 组件本身 , 注意如果是文本组件 ，如果处于选中状态，则目前处理是，textarea与这里的div Text重叠*/}
      <div
        className={styles.cmp}
        style={{
          width: innerWidth,
          height: innerHeight,
        }}>
        {cmp.type === isTextComponent && <Text {...cmp} />}
        {cmp.type === isImgComponent && <Img {...cmp} />}
      </div>
    </div>
  );
}
