export const template = `
  <svg style="width: 1em; height: 1em; fill:currentColor ">
    <use :xlink:href="'#' + name" />
  </svg>
`
export const dts = `
declare module 'virtual:svg-component' {
  import type { PropType } from 'vue';
  const _default: import("vue").DefineComponent<{
      name: {
          type: PropType<"$svg_symbolIds">;
          default: string;
          required: true;
      };
  }, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
      name: {
          type: PropType<"$svg_symbolIds">;
          default: string;
          required: true;
      };
  }>>, {
      name: "$svg_symbolIds";
  }>;
  export default _default;
}
`

