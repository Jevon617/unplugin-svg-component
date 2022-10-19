
import '@vue/runtime-core'
declare module '@vue/runtime-core' {
  import type { PropType } from 'vue';
  export interface GlobalComponents {
    SvgIcon: import("vue").DefineComponent<{
        name: {
            type: PropType<"icon-addUser" | "icon-barCode" | "icon-card2" | "common-icon-add" | "common-icon-add3" | "common-icon-addUser" | "common-icon-addUsers" | "common-icon-addx" | "common-icon-apple" | "common-icon-banner">;
            default: string;
            required: true;
        };
    }, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
        name: {
            type: PropType<"icon-addUser" | "icon-barCode" | "icon-card2" | "common-icon-add" | "common-icon-add3" | "common-icon-addUser" | "common-icon-addUsers" | "common-icon-addx" | "common-icon-apple" | "common-icon-banner">;
            default: string;
            required: true;
        };
    }>>, {
        name: "icon-addUser" | "icon-barCode" | "icon-card2" | "common-icon-add" | "common-icon-add3" | "common-icon-addUser" | "common-icon-addUsers" | "common-icon-addx" | "common-icon-apple" | "common-icon-banner";
    }>;
  }
}
