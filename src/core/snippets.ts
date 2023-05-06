import { MODULE_NAME } from './constants'

export const template = `
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    xmlns:xlink="http://www.w3.org/1999/xlink" 
    style="$component_style"
    v-on="$listeners"
  >
    <use :xlink:href="'#' + name" />
  </svg>
`
export const dts = `
declare module '${MODULE_NAME}' {
  const $component_name: import("vue").DefineComponent<{
      name: {
          type: import("vue").PropType<"$svg_symbolIds">;
          default: string;
          required: true;
      };
  }, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
      name: {
          type: import("vue").PropType<"$svg_symbolIds">;
          default: string;
          required: true;
      };
  }>>, {
      name: "$svg_symbolIds";
  }>;
  export const svgNames: ["$svg_names"];
  export type SvgName = "$svg_symbolIds";
  export default $component_name;
}
`

export const golbalDts = `
import 'vue'
declare module 'vue' {
  export interface GlobalComponents {
    $component_name: import("vue").DefineComponent<{
        name: {
            type: import("vue").PropType<"$svg_symbolIds">;
            default: string;
            required: true;
        };
    }, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
        name: {
            type: import("vue").PropType<"$svg_symbolIds">;
            default: string;
            required: true;
        };
    }>>, {
        name: "$svg_symbolIds";
    }>;
  }
}
`

export const reactTemplate = `
import React from 'react';

export default function $component_name({name}) {
  return React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    xmlnsXlink: "http://www.w3.org/1999/xlink",
    style: $component_style
  }, React.createElement("use", {
    xlinkHref: "#" + name
  }));
}
`
export const reactDts = `
declare module '${MODULE_NAME}' {
  const $component_name: ({name}: {name: "$svg_symbolIds"})=> JSX.Element;
  export const svgNames: ["$svg_names"];
  export type SvgName = "$svg_symbolIds";
  export default $component_name;
}
`
