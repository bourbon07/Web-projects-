<template>
  <button
    :class="buttonClasses"
    :style="buttonStyle"
    v-bind="$attrs"
  >
    <span v-if="variant === 'primary'" class="relative z-10 drop-shadow-md flex items-center justify-center gap-2" :dir="$attrs.dir">
      <slot />
    </span>
    <span v-else class="flex items-center justify-center gap-2" :dir="$attrs.dir">
      <slot />
    </span>
  </button>
</template>

<script setup>
import { computed } from 'vue';
const woodTexture = '/bde3a495c5ad0d23397811532fdfa02fe66f448c.png';

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'outline', 'ghost'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
  }
});

const sizeClasses = {
  xs: 'px-2 py-1 text-xs gap-1',
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-base gap-2',
  lg: 'px-6 py-3 text-lg gap-2',
  xl: 'px-8 py-4 text-xl gap-2.5',
};

const buttonClasses = computed(() => {
  const base = `relative overflow-hidden rounded-lg font-medium transition-all duration-200 ${sizeClasses[props.size]} disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`;
  
  if (props.variant === 'primary') {
    return `${base} text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95`;
  }
  
  if (props.variant === 'secondary') {
    return `${base} bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100 border-2 border-amber-800/30 hover:bg-amber-200 dark:hover:bg-amber-900/50`;
  }
  
  if (props.variant === 'ghost') {
    return `${base} bg-transparent text-amber-900 dark:text-amber-100 hover:bg-amber-100 dark:hover:bg-amber-900/30`;
  }
  
  return `${base} bg-transparent border-2 border-amber-800 dark:border-amber-600 text-amber-900 dark:text-amber-100 hover:bg-amber-800 hover:text-white dark:hover:bg-amber-600`;
});

const buttonStyle = computed(() => {
  if (props.variant === 'primary') {
    return {
      backgroundImage: `url(${woodTexture})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }
  return {};
});
</script>

