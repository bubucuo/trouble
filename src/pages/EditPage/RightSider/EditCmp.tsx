import InputColor from "src/lib/InputColor";
import Item from "src/lib/Item";
import {
  editAssemblyStyle,
  updateSelectedCmpAttr,
  updateSelectedCmpStyle,
} from "src/store/editStore";
import type {ICmpWithKey, Style} from "src/store/editStoreTypes";
import {isImgComponent, isTextComponent} from "../LeftSider";
import styles from "./edit.module.less";

export default function EditCmp({selectedCmp}: {selectedCmp: ICmpWithKey}) {
  const {value, style, onClick = ""} = selectedCmp;

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    updateSelectedCmpAttr("value", newValue);
  };

  type Pair = {name: string; value: string | number};
  const handleStyleChange = (
    e: any, //目前没有用到
    _pair: Pair | Array<Pair>
  ) => {
    const pair: Array<Pair> = Array.isArray(_pair) ? _pair : [_pair];
    const newStyle: Style = {};
    pair.forEach((element) => {
      const {name, value} = element;
      newStyle[name] = value;
    });
    updateSelectedCmpStyle(newStyle);
  };

  const handleAnimationStyleChange = (
    e: any, //目前没有用到
    {name, value}: {name: string; value: string | number}
  ) => {
    let newStyle = {
      animationName: value,
      animationIterationCount:
        style.animationIterationCount == undefined
          ? 1
          : style.animationIterationCount,
      animationDuration:
        style.animationDuration == undefined ? "1s" : style.animationDuration,
      animationDelay:
        style.animationDelay == undefined ? 0 : style.animationDelay,
      animationPlayState: "running",
    };

    updateSelectedCmpStyle(newStyle);
  };

  const handleAttrChange = (
    e: any, //目前没有用到
    {name, value}: {name: string; value: string}
  ) => {
    updateSelectedCmpAttr(name, value);
  };

  return (
    <div className={styles.main}>
      <div className={styles.title}>组件属性</div>

      {selectedCmp.type === isImgComponent && (
        <Item label="描述: ">
          <input
            type="text"
            className={styles.itemRight}
            value={value}
            onChange={handleValueChange}
          />
        </Item>
      )}

      {style.fontSize !== undefined && (
        <Item label="字体大小: ">
          <input
            type="number"
            className={styles.itemRight}
            value={style.fontSize}
            onChange={(e) => {
              handleStyleChange(e, {
                name: "fontSize",
                value: parseInt(e.target.value) - 0,
              });
            }}
          />
        </Item>
      )}

      {style.fontWeight !== undefined && (
        <Item label="字体粗细: ">
          <select
            className={styles.itemRight}
            value={style.fontWeight}
            onChange={(e) => {
              handleStyleChange(e, {
                name: "fontWeight",
                value: e.target.value,
              });
            }}>
            <option value="normal">normal</option>
            <option value="bold">bold</option>
            <option value="lighter">lighter</option>
          </select>
        </Item>
      )}

      {style.lineHeight !== undefined && (
        <Item label="行高: ">
          <input
            type="number"
            className={styles.itemRight}
            value={parseInt(style.lineHeight)}
            onChange={(e) => {
              handleStyleChange(e, {
                name: "lineHeight",
                value: e.target.value + "px",
              });
            }}
          />
        </Item>
      )}

      {selectedCmp.type === isTextComponent && (
        <Item
          label="装饰线: "
          tips="如果设置完还是看不到装饰线，调整下行高试试~">
          <select
            className={styles.itemRight}
            value={style.textDecoration || "none"}
            onChange={(e) => {
              handleStyleChange(e, {
                name: "textDecoration",
                value: e.target.value,
              });
            }}>
            <option value="none">无</option>
            <option value="underline">下划线</option>
            <option value="overline">上划线</option>
            <option value="line-through">删除线</option>
          </select>
        </Item>
      )}

      {style.textAlign !== undefined && (
        <Item label="对齐: ">
          <select
            className={styles.itemRight}
            value={style.textAlign}
            onChange={(e) => {
              handleStyleChange(e, {
                name: "textAlign",
                value: e.target.value,
              });
            }}>
            <option value="left">居左</option>
            <option value="center">居中</option>
            <option value="right">居右</option>
          </select>
        </Item>
      )}

      <Item label="对齐页面: ">
        <select
          className={styles.itemRight}
          onChange={(e) => {
            const align = e.target.value;
            let newStyle: Style = {};
            switch (align) {
              case "left":
                newStyle.left = 0;
                break;
              case "right":
                newStyle.right = 0;
                break;

              case "x-center":
                newStyle.left = "center";
                break;
              case "top":
                newStyle.top = 0;
                break;
              case "bottom":
                newStyle.bottom = 0;
                break;

              case "y-center":
                newStyle.top = "center";
                break;
            }
            editAssemblyStyle(newStyle);
          }}>
          <option>选择对齐页面方式--</option>
          <option value="left">左对齐</option>
          <option value="right">右对齐</option>
          <option value="x-center">水平居中</option>
          <option value="top">上对齐</option>
          <option value="bottom">下对齐</option>
          <option value="y-center">垂直居中</option>
        </select>
      </Item>

      {style.transform !== undefined && (
        <Item label="旋转: ">
          <input
            className={styles.itemRight}
            type="number"
            value={style.transform}
            onChange={(e) =>
              handleStyleChange(e, {
                name: "transform",
                value: e.target.value,
              })
            }
          />
        </Item>
      )}

      {style.borderRadius !== undefined && (
        <Item label="圆角: ">
          <input
            className={styles.itemRight}
            type="text"
            value={style.borderRadius}
            onChange={(e) =>
              handleStyleChange(e, {
                name: "borderRadius",
                value: e.target.value,
              })
            }
          />
        </Item>
      )}

      <Item label="边框样式: ">
        <select
          className={styles.itemRight}
          value={style.borderStyle}
          onChange={(e) => {
            handleStyleChange(e, {
              name: "borderStyle",
              value: e.target.value,
            });
          }}>
          <option value="none">none</option>
          <option value="dashed">dashed</option>
          <option value="dotted">dotted</option>
          <option value="double">double</option>
          <option value="groove">groove</option>
          <option value="hidden">hidden</option>
          <option value="solid">solid</option>
        </select>
      </Item>

      <Item label="边框宽度: ">
        <input
          className={styles.itemRight}
          type="number"
          value={style.borderWidth}
          onChange={(e) =>
            handleStyleChange(e, {
              name: "borderWidth",
              value: parseInt(e.target.value) - 0,
            })
          }
        />
      </Item>

      <Item label="边框颜色: ">
        <InputColor
          className={styles.itemRight}
          color={style.borderColor || "#ffffff00"}
          onChangeComplete={(e: any) =>
            handleStyleChange(null, {
              name: "borderColor",
              value: `rgba(${Object.values(e.rgb).join(",")})`,
            })
          }
        />
      </Item>

      {style.color !== undefined && (
        <Item label="字体颜色: ">
          <InputColor
            className={styles.itemRight}
            color={style.color}
            onChangeComplete={(e) =>
              handleStyleChange(null, {
                name: "color",
                value: `rgba(${Object.values(e.rgb).join(",")})`,
              })
            }
          />
        </Item>
      )}

      {style.backgroundColor !== undefined && (
        <Item label="背景颜色: ">
          <InputColor
            className={styles.itemRight}
            color={style.backgroundColor}
            onChangeComplete={(e) => {
              handleStyleChange(null, {
                name: "backgroundColor",
                value: `rgba(${Object.values(e.rgb).join(",")})`,
              });
            }}
          />
        </Item>
      )}

      <Item label="点击跳转: ">
        <input
          className={styles.itemRight}
          type="text"
          value={onClick}
          onChange={(e) =>
            handleAttrChange(e, {
              name: "onClick",
              value: e.target.value,
            })
          }
        />
      </Item>

      <Item label="动画名称">
        <select
          className={styles.itemRight}
          value={style.animationName || ""}
          onChange={(e) => {
            handleAnimationStyleChange(e, {
              name: "animationName",
              value: e.target.value,
            });
          }}>
          <option value="">无动画</option>
          <option value="toggle">闪烁</option>
          <option value="jello">果冻</option>
          <option value="shake">抖动</option>
          <option value="wobble">左右摇摆</option>
        </select>
      </Item>
      {/* 用户定义了动画名称，以下动画属性才是有效的 */}
      {style.animationName && (
        <>
          <Item label="动画持续时长(s)">
            <input
              type="number"
              className={styles.itemRight}
              value={parseInt(style.animationDuration)}
              onChange={(e) => {
                handleStyleChange(e, {
                  name: "animationDuration",
                  value: e.target.value + "s",
                });
              }}
            />
          </Item>

          <Item label="动画循环次数" tips="999表示无数次">
            <input
              className={styles.itemRight}
              type="number"
              value={
                style.animationIterationCount === "infinite"
                  ? 999
                  : style.animationIterationCount
              }
              onChange={(e) =>
                handleStyleChange(e, {
                  name: "animationIterationCount",
                  value:
                    parseInt(e.target.value) === 999
                      ? "infinite"
                      : e.target.value,
                })
              }
            />
          </Item>
          <Item label="动画延迟时间(s)">
            <input
              className={styles.itemRight}
              type="number"
              value={parseInt(style.animationDelay)}
              onChange={(e) =>
                handleStyleChange(e, {
                  name: "animationDelay",
                  value: e.target.value + "s",
                })
              }
            />
          </Item>
          <button
            className={styles.pauseAnimation}
            onClick={(e) => {
              const value = style.animationName;
              handleStyleChange(e, {
                name: "animationName",
                value: "",
              });
              setTimeout(() => {
                handleStyleChange(e, [
                  {
                    name: "animationName",
                    value,
                  },
                  {
                    name: "animationPlayState",
                    value: "running",
                  },
                ]);
              }, 0);
            }}>
            重新演示动画
          </button>

          <button
            className={styles.pauseAnimation}
            onClick={(e) => {
              handleStyleChange(e, {
                name: "animationPlayState",
                value: "paused",
              });
            }}>
            暂停演示动画
          </button>
        </>
      )}
    </div>
  );
}
