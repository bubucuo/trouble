export function Text({value}: {value: string | undefined}) {
  return <>{value}</>;
}

export function Img({value}: {value: string | undefined}) {
  return <img src={value} alt="" />;
}
