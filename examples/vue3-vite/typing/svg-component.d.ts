
declare module '~virtual/svg-component' {
  const MySvgIcon: import("vue").DefineComponent<{
      name: {
          type: import("vue").PropType<"icon-icon-addUser" | "icon-common-logo" | "icon-icon-card11" | "icon-icon-barCode">;
          default: string;
          required: true;
      };
  }, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
      name: {
          type: import("vue").PropType<"icon-icon-addUser" | "icon-common-logo" | "icon-icon-card11" | "icon-icon-barCode">;
          default: string;
          required: true;
      };
  }>>, {
      name: "icon-icon-addUser" | "icon-common-logo" | "icon-icon-card11" | "icon-icon-barCode";
  }>;
  export const svgNames: ["icon-icon-addUser" , "icon-common-logo" , "icon-icon-card11" , "icon-icon-barCode"];
  export type SvgName = "icon-icon-addUser" | "icon-common-logo" | "icon-icon-card11" | "icon-icon-barCode";
  export default MySvgIcon;
}
