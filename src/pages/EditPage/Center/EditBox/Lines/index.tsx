import classNames from "classnames";
import styles from "./index.module.less";
interface ILinesProps {
  style: any;
  basePos?: number;
}

export default function Lines(props: ILinesProps) {
  const {style, basePos = 0} = props;
  const {width, height} = style;
  return (
    <>
      <div
        className={classNames(styles.line, styles.xLine)}
        style={{width, top: -2 - basePos, left: -2 - basePos}}
      />
      <div
        className={classNames(styles.line, styles.xLine)}
        style={{width, top: height - basePos, left: -2 - basePos}}
      />

      <div
        className={classNames(styles.line, styles.yLine)}
        style={{height: height + 4, top: -2 - basePos, left: -2 - basePos}}
      />
      <div
        className={classNames(styles.line, styles.yLine)}
        style={{
          height: height + 4,
          top: -2 - basePos,
          left: width - basePos - 2,
        }}
      />
    </>
  );
}
