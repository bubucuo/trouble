import {useState} from "react";
import {SketchPicker} from "react-color";

export default function InputColor({onChangeComplete, color, ...rest}: any) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      style={{
        position: "relative",
        backgroundColor: color,
      }}
      {...rest}
      onClick={(e) => {
        if (!visible) {
          setVisible(true);
        }
      }}
      onMouseLeave={() => {
        setVisible(false);
      }}>
      {visible && (
        <div
          style={{
            zIndex: 1,
            position: "relative",
            marginTop: "32px",
            marginLeft: "-70px",
            padding: "10px",
            width: "340px",
            border: "solid 1px #333",
            backgroundColor: "white",
          }}>
          <span
            style={{
              zIndex: 999,
              position: "absolute",
              top: 0,
              left: "4px",
              color: "#999",
              cursor: "pointer",
            }}
            onClick={(e) => {
              setVisible(false);
            }}>
            关闭
          </span>
          <SketchPicker color={color} onChangeComplete={onChangeComplete} />
        </div>
      )}
    </div>
  );
}
