import React from "react";
import Img from "../Img";
import Lines from "../EditLine/Lines";
import type {ICmpWithKey} from "src/store/editStoreTypes";
import styles from "./index.module.less";
import {isImgComponent, isTextComponent} from "../../Left";

import Text from "../Text";
import {isEqual} from "lodash";

interface ICmpProps {
  cmp: ICmpWithKey;
  index: number;
  selectedIndex: number;
  isSelected: boolean;
  setCmpsSelected: (indexes: number | Array<number>) => void;
}

const Cmp = React.memo(
  (props: ICmpProps) => {
    const {cmp, index, selectedIndex, isSelected, setCmpsSelected} = props;

    const {style} = cmp;

    const {width, height} = style;
    const transform = `rotate(${style.transform}deg)`;

    const zIndex = index;

    const innerWidth =
      (style.width as number) - (style.borderWidth as number) * 2;
    const innerHeight =
      (style.height as number) - (style.borderWidth as number) * 2;

    const setSelected = (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.metaKey) {
        // 把选中的组件填入组件集合
        setCmpsSelected([index]);
      } else {
        setCmpsSelected(index);
      }
    };

    console.log("cmp render"); //sy-log
    return (
      <div
        className={styles.main}
        style={{
          ...style,
          transform,
          zIndex,
        }}
        onClick={setSelected}>
        {selectedIndex !== index && isSelected && (
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
  },
  (prev: ICmpProps, next: ICmpProps): boolean => {
    let noChange =
      isEqual(prev.cmp, next.cmp) &&
      isEqual(prev.index, next.index) &&
      isEqual(prev.isSelected, next.isSelected);
    return noChange;
  }
);

export default Cmp;
