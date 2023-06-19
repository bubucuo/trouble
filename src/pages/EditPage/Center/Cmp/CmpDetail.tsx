export function Text({value}: {value: string | undefined}) {
  return <>{value}</>;
}

export function Img({value}: {value: string | undefined}) {
  return <img src={value} alt="" />;
}

export function Input({inputType, placeholder, value, formItemName}: any) {
  return (
    <>
      <input
        type={inputType}
        placeholder={placeholder}
        style={{width: "100%", height: "100%"}}
        disabled
        value={value}
        checked={value}
        name={formItemName}
        onChange={() => {}}
      />
    </>
  );
}

export function Button({value}: {value: string | undefined}) {
  return <>{value}</>;
}
