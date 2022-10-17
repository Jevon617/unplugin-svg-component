<script lang="ts" setup>
import type { PropType } from 'vue'
import { computed } from 'vue'

type IconNames = ''
const props = defineProps({
  iconClass: {
    type: String as PropType<IconNames>,
    required: true,
  },
  className: {
    type: String,
    default: '',
  },
})

const iconName = computed(() => `#${props.iconClass}`)
const svgClass = computed(() => {
  if (props.className)
    return `svg-icon ${props.className}`

  return 'svg-icon'
})
</script>

<template>
  <svg
    :class="svgClass"
    aria-hidden="true"
  >
    <use :xlink:href="iconName" />
  </svg>
</template>
