<script setup lang="ts">
import { Input as VbenInput } from '../../ui/input';

interface Props {
  captcha?: string;
  label?: string;
  loading?: boolean;
  placeholder?: string;
}

withDefaults(defineProps<Props>(), {
  captcha: '',
  label: '验证码',
  loading: false,
  placeholder: '请输入验证码',
});

defineEmits<{ captchaClick: [] }>();

const modelValue = defineModel<string>({ default: '' });
</script>

<!-- 图片验证码 -->
<template>
  <div class="flex w-full">
    <div class="flex-1">
      <VbenInput
        id="code"
        name="code"
        type="text"
        autocomplete="off"
        required
        v-model="modelValue"
        :class="$attrs?.class ?? {}"
        :label="label"
        :placeholder="placeholder"
      />
    </div>
    <div class="captcha-image--container relative">
      <img
        :src="captcha"
        class="h-[40px] w-[115px] cursor-pointer rounded-r-md"
        :class="{ 'pointer-events-none': loading }"
        @click="$emit('captchaClick')"
      />
      <div
        v-if="loading"
        class="absolute inset-0 flex cursor-not-allowed items-center justify-center rounded-r-md bg-black/30"
      >
        <span class="captcha-loading"></span>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@keyframes loading-rotation {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.captcha-loading {
  box-sizing: border-box;
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid #fff;
  border-bottom-color: transparent;
  border-radius: 50%;
  animation: loading-rotation 1s linear infinite;
}

/**
  验证码输入框样式
  去除右边的圆角
*/
input[id='code'] {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
</style>
