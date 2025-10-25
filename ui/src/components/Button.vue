<template>
  <button 
    :class="[
      'px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105',
      variantClasses
    ]"
    @click="$emit('click')"
  >
    <slot>{{ text }}</slot>
  </button>
</template>

<script>
export default {
  name: 'Button',
  props: {
    variant: {
      type: String,
      default: 'primary',
      validator: value => ['primary', 'secondary', 'danger'].includes(value)
    },
    text: {
      type: String,
      default: 'Click me!'
    }
  },
  computed: {
    variantClasses() {
      const variants = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg',
        secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 border border-gray-300',
        danger: 'bg-red-600 hover:bg-red-700 text-white shadow-lg'
      }
      return variants[this.variant]
    }
  },
  emits: ['click']
}
</script>