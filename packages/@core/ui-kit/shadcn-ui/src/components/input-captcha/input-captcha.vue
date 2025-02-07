<script setup lang="ts">
import { Input as VbenInput } from '../ui/input';
/**
 * 非通用组件 直接按业务来写
 */
defineProps({
  captcha: {
    default: '',
    type: String,
  },
  label: {
    default: '验证码',
    type: String,
  },
  placeholder: {
    default: '验证码',
    type: String,
  },
});

defineEmits<{ captchaClick: [] }>();

const modelValue = defineModel({ default: '', type: String });
</script>

<template>
  <!-- 图片验证码 -->
  <div class="flex w-full">
    <div class="flex-1">
      <VbenInput
        id="code"
        v-model="modelValue"
        :class="$attrs.class ?? {}"
        :label="label"
        :placeholder="placeholder"
        name="code"
        required
        type="text"
      />
    </div>
    <img
      :src="captcha"
      class="h-[40px] w-[115px] rounded-r-md"
      @click="$emit('captchaClick')"
    />
  </div>
</template>

<style lang="scss">
/**
  验证码输入框样式
  去除右边的圆角
*/
input[id='code'] {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
</style>
