import Item from "src/lib/Item";
import styles from "./edit.module.less";
import {Style} from "src/store/editStoreTypes";
import type {HandleAttributesChangeType} from "./EditCmp";
import InputColor from "src/lib/InputColor";
import {updateSelectedCmpStyle} from "src/store/editStore";

interface Props {
  value?: string;
  placeholder?: string;
  inputType?: string;
  onClick?:
    | string
    | {
        url: string;
        afterSuccess: "pop" | "url";
        popMsg?: string;
        link?: string;
      };
  styleName: string;
  styleValue: Style;
  label?: string;
  handleAttributesChange: HandleAttributesChangeType;
}

export default function EditCmpStyle({
  value,
  placeholder,
  inputType,
  onClick,
  styleName,
  styleValue,
  label,
  handleAttributesChange,
}: Props) {
  const handleAnimationStyleChange = (
    e: any, //目前没有用到
    {name, value}: {name: string; value: string | number}
  ) => {
    let newStyle = {
      animationName: value,
      animationIterationCount:
        styleValue.animationIterationCount == undefined
          ? 1
          : styleValue.animationIterationCount,
      animationDuration:
        styleValue.animationDuration == undefined
          ? "1s"
          : styleValue.animationDuration,
      animationDelay:
        styleValue.animationDelay == undefined ? 0 : styleValue.animationDelay,
      animationPlayState: "running",
    };

    updateSelectedCmpStyle(newStyle);
  };

  return (
    <>
      {value !== undefined && (
        <Item label="描述: ">
          <input
            type="text"
            className={styles.itemRight}
            value={value}
            onChange={(e) => {
              handleAttributesChange({value: e.target.value});
            }}
          />
        </Item>
      )}

      {label !== undefined && (
        <Item label="标签: ">
          <input
            type="text"
            className={styles.itemRight}
            value={label}
            onChange={(e) => {
              handleAttributesChange({label: e.target.value});
            }}
          />
        </Item>
      )}

      {placeholder !== undefined && (
        <Item label="提示输入: ">
          <input
            type="text"
            className={styles.itemRight}
            value={placeholder}
            onChange={(e) => {
              handleAttributesChange({placeholder: e.target.value});
            }}
          />
        </Item>
      )}
      {inputType !== undefined && (
        <Item label="文本类型: ">
          <select
            className={styles.itemRight}
            value={inputType}
            onChange={(e) => {
              handleAttributesChange({inputType: e.target.value});
            }}>
            <option value="text">文本</option>
            <option value="number">数字</option>
            <option value="password">密码</option>
            <option value="date">日期</option>
            <option value="checkbox">checkbox</option>
          </select>
        </Item>
      )}

      {/* 字体 */}
      {styleValue.fontSize !== undefined && (
        <>
          <Item label="字体大小: ">
            <input
              type="number"
              className={styles.itemRight}
              value={styleValue.fontSize}
              onChange={(e) => {
                handleAttributesChange({
                  [styleName]: {
                    fontSize: parseInt(e.target.value) - 0,
                  },
                });
              }}
            />
          </Item>

          <Item label="字体粗细: ">
            <select
              className={styles.itemRight}
              value={styleValue.fontWeight}
              onChange={(e) => {
                handleAttributesChange({
                  [styleName]: {
                    fontWeight: e.target.value,
                  },
                });
              }}>
              <option value="normal">normal</option>
              <option value="bold">bold</option>
              <option value="lighter">lighter</option>
            </select>
          </Item>

          <Item label="行高: ">
            <input
              type="number"
              className={styles.itemRight}
              value={parseInt(styleValue.lineHeight)}
              onChange={(e) => {
                handleAttributesChange({
                  [styleName]: {
                    lineHeight: e.target.value + "px",
                  },
                });
              }}
            />
          </Item>
          <Item label="对齐: ">
            <select
              className={styles.itemRight}
              value={styleValue.textAlign}
              onChange={(e) => {
                handleAttributesChange({
                  [styleName]: {
                    textAlign: e.target.value,
                  },
                });
              }}>
              <option value="left">居左</option>
              <option value="center">居中</option>
              <option value="right">居右</option>
            </select>
          </Item>
          <Item label="字体颜色: ">
            <InputColor
              className={styles.itemRight}
              color={styleValue.color}
              onChangeComplete={(e) =>
                handleAttributesChange({
                  [styleName]: {
                    color: `rgba(${Object.values(e.rgb).join(",")})`,
                  },
                })
              }
            />
          </Item>
          <Item
            label="装饰线: "
            tips="如果设置完还是看不到装饰线，调整下行高试试~">
            <select
              className={styles.itemRight}
              value={styleValue.textDecoration || "none"}
              onChange={(e) => {
                handleAttributesChange({
                  [styleName]: {
                    textDecoration: e.target.value,
                  },
                });
              }}>
              <option value="none">无</option>
              <option value="underline">下划线</option>
              <option value="overline">上划线</option>
              <option value="line-through">删除线</option>
            </select>
          </Item>
        </>
      )}

      {/* 边框 */}
      {styleValue.borderStyle !== undefined && (
        <>
          <Item label="边框样式: ">
            <select
              className={styles.itemRight}
              value={styleValue.borderStyle}
              onChange={(e) => {
                handleAttributesChange({
                  [styleName]: {
                    borderStyle: e.target.value,
                  },
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
              value={styleValue.borderWidth}
              onChange={(e) =>
                handleAttributesChange({
                  [styleName]: {
                    borderWidth: parseInt(e.target.value) - 0,
                  },
                })
              }
            />
          </Item>

          <Item label="边框颜色: ">
            <InputColor
              className={styles.itemRight}
              color={styleValue.borderColor || "#ffffff00"}
              onChangeComplete={(e: any) =>
                handleAttributesChange({
                  [styleName]: {
                    borderColor: `rgba(${Object.values(e.rgb).join(",")})`,
                  },
                })
              }
            />
          </Item>
          <Item label="圆角: ">
            <input
              className={styles.itemRight}
              type="text"
              value={styleValue.borderRadius}
              onChange={(e) =>
                handleAttributesChange({
                  [styleName]: {
                    borderRadius: e.target.value,
                  },
                })
              }
            />
          </Item>
        </>
      )}
      {styleValue.backgroundColor !== undefined && (
        <Item label="背景颜色: ">
          <InputColor
            className={styles.itemRight}
            color={styleValue.backgroundColor}
            onChangeComplete={(e) => {
              handleAttributesChange({
                [styleName]: {
                  backgroundColor: `rgba(${Object.values(e.rgb).join(",")})`,
                },
              });
            }}
          />
        </Item>
      )}

      {/* 旋转 */}
      {styleValue.transform !== undefined && (
        <Item label="旋转: ">
          <input
            className={styles.itemRight}
            type="number"
            value={styleValue.transform}
            onChange={(e) =>
              handleAttributesChange({
                [styleName]: {
                  transform: e.target.value,
                },
              })
            }
          />
        </Item>
      )}

      <Item label="动画名称">
        <select
          className={styles.itemRight}
          value={styleValue.animationName || ""}
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

      {/* 动画 */}
      {styleValue.animationName !== undefined && (
        <>
          {/* 用户定义了动画名称，以下动画属性才是有效的 */}
          {styleValue.animationName && (
            <>
              <Item label="动画持续时长(s)">
                <input
                  type="number"
                  className={styles.itemRight}
                  value={parseInt(styleValue.animationDuration)}
                  onChange={(e) => {
                    handleAttributesChange({
                      [styleName]: {
                        animationDuration: e.target.value + "s",
                      },
                    });
                  }}
                />
              </Item>

              <Item label="动画循环次数" tips="999表示无数次">
                <input
                  className={styles.itemRight}
                  type="number"
                  value={
                    styleValue.animationIterationCount === "infinite"
                      ? 999
                      : styleValue.animationIterationCount
                  }
                  onChange={(e) =>
                    handleAttributesChange({
                      [styleName]: {
                        animationIterationCount:
                          parseInt(e.target.value) === 999
                            ? "infinite"
                            : e.target.value,
                      },
                    })
                  }
                />
              </Item>
              <Item label="动画延迟时间(s)">
                <input
                  className={styles.itemRight}
                  type="number"
                  value={parseInt(styleValue.animationDelay)}
                  onChange={(e) => {
                    handleAttributesChange({
                      [styleName]: {
                        animationDelay: e.target.value + "s",
                      },
                    });
                  }}
                />
              </Item>
              <button
                className={styles.pauseAnimation}
                onClick={(e) => {
                  const value = styleValue.animationName;

                  handleAttributesChange({
                    [styleName]: {
                      animationName: "",
                    },
                  });

                  setTimeout(() => {
                    handleAttributesChange({
                      [styleName]: {
                        animationName: value,
                        animationPlayState: "running",
                      },
                    });
                  }, 0);
                }}>
                重新演示动画
              </button>

              <button
                className={styles.pauseAnimation}
                onClick={(e) => {
                  handleAttributesChange({
                    [styleName]: {
                      animationPlayState: "paused",
                    },
                  });
                }}>
                暂停演示动画
              </button>
            </>
          )}
        </>
      )}

      {/* 跳转页面 | 服务端请求 */}
      {typeof onClick === "object" ? (
        <>
          <Item label="post地址: ">
            <input
              className={styles.itemRight}
              type="text"
              value={onClick.url}
              onChange={(e) =>
                handleAttributesChange({
                  onClick: {...onClick, url: e.target.value},
                })
              }
            />
          </Item>

          <Item label="成功事件">
            <select
              className={styles.itemRight}
              value={onClick.afterSuccess}
              onChange={(e) => {
                handleAttributesChange({
                  onClick: {...onClick, afterSuccess: e.target.value},
                });
              }}>
              <option value="pop">弹窗提示</option>
              <option value="url">跳转链接</option>
            </select>
          </Item>

          {onClick.afterSuccess === "pop" && (
            <Item label="弹窗提示: ">
              <input
                className={styles.itemRight}
                type="text"
                value={onClick.popMsg}
                onChange={(e) => {
                  handleAttributesChange({
                    onClick: {...onClick, popMsg: e.target.value},
                  });
                }}
              />
            </Item>
          )}

          {onClick.afterSuccess === "url" && (
            <Item label="跳转链接: ">
              <input
                className={styles.itemRight}
                type="text"
                value={onClick.link}
                onChange={(e) => {
                  handleAttributesChange({
                    onClick: {...onClick, link: e.target.value},
                  });
                }}
              />
            </Item>
          )}
        </>
      ) : (
        <Item label="点击跳转: ">
          <input
            className={styles.itemRight}
            type="text"
            value={onClick}
            onChange={(e) => handleAttributesChange({onClick: e.target.value})}
          />
        </Item>
      )}
    </>
  );
}
