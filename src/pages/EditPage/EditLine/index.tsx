import React, {useRef, useState} from "react";
import StretchDots from "./StretchDots";
import Rotate from "./Rotate";
import Lines from "./Lines";
import {isTextComponent} from "../Left";
import styles from "./index.module.less";
import useEditStore, {dontRecordHistory} from "src/store/editStore";
import {throttle} from "lodash";
import {selectedCmpSelector} from "../../../store/editStore";

interface IEditLineProps {
  zoom: number;
  selectedIndex: number;
}

export default function EditLine(props: IEditLineProps) {
  const editStore = useEditStore();
  const textareaRef = useRef<any>();

  const [textareaFocused, setTextareaFocused] = useState<boolean>(false);

  // 在画布上移动组件位置
  const onMouseDownOfCmp = (e) => {
    if (textareaFocused) {
      return;
    }

    // 否则会触发其他组件的选中行为
    e.preventDefault();

    let startX = e.pageX;
    let startY = e.pageY;

    const {zoom} = props;
    let hasMoved = false;
    const move = throttle((e) => {
      hasMoved = true;
      const x = e.pageX;
      const y = e.pageY;

      let disX = x - startX;
      let disY = y - startY;

      disX = disX * (100 / zoom);
      disY = disY * (100 / zoom);

      editStore.updateAssemblyCmps({top: disY, left: disX}, dontRecordHistory);

      startX = x;
      startY = y;
    }, 50);

    const up = () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
      if (hasMoved) {
        editStore.recordCanvasChangeHistoryAfterBatch();
      }
    };
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  };

  const valueChange = (e) => {
    const newValue = e.target.value;
    // 如果改变文本高度，则调整组件框高度
    const textHeight = textareaRef?.current?.scrollHeight;
    editStore.updateSelectedCmpStyleAndValue({height: textHeight}, newValue);
  };

  const {zoom} = props;
  const cmp = selectedCmpSelector(editStore);

  if (!cmp) {
    // 没有选择线
    return null;
  }

  const {style} = cmp;

  const {width, height} = style;
  const transform = `rotate(${style.transform}deg)`;

  // width height是组件本身宽度
  // dot直径 16
  // line 宽 2
  // rotate 直径 26
  // rotate距离边框距离为30
  return (
    <div
      className={styles.main}
      style={{
        zIndex: 99999,
        width,
        height,
        top: style.top,
        left: style.left,
        transform,
      }}
      // 双击，编辑文本
      onDoubleClick={(e) => {
        setTextareaFocused(true);
      }}>
      {cmp.type === isTextComponent && textareaFocused ? (
        <textarea
          ref={textareaRef}
          value={cmp.value}
          onChange={valueChange}
          onBlur={() => {
            setTextareaFocused(false);
          }}
          style={{
            ...style,
            width,
            height,
            top: 0,
            left: 0,
          }}
        />
      ) : (
        // 拖拽组件的有效蒙层
        <div
          className={styles.eventMask}
          style={{
            width,
            height,
          }}
          onMouseDown={onMouseDownOfCmp}></div>
      )}

      {/* 选中组件的边界线 */}
      <Lines style={{width, height}} />
      {/* 拉伸组件的八个点 */}
      <StretchDots
        zoom={zoom}
        style={{
          width,
          height,
          transform: `scale(${100 / zoom})`,
        }}
      />
      {/* 旋转组件的标记 */}
      <Rotate
        zoom={zoom}
        style={{width, height, transform: `scale(${100 / zoom})`}}
      />
    </div>
  );
}
