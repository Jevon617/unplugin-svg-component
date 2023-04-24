
declare module '~virtual/svg-component' {
  const MySvgIcon: ({name}: {name: "icon-icon-addUser" | "icon-icon-barCode" | "icon-icon-card2" | "icon-react"})=> JSX.Element;
  export const svgNames: ["icon-icon-addUser" , "icon-icon-barCode" , "icon-icon-card2" , "icon-react"];
  export type SvgName = "icon-icon-addUser" | "icon-icon-barCode" | "icon-icon-card2" | "icon-react";
  export default MySvgIcon;
}
