<!-- eslint-disable eqeqeq -->
<script lang="tsx">
import type { PropType } from 'vue';

import type { DictFallback } from './type';

import type { DictData } from '#/api/system/dict/dict-data-model';

import { computed, defineComponent, h, isVNode } from 'vue';

import { Spin, Tag } from 'ant-design-vue';
import { isFunction, isString } from 'lodash-es';

import { tagTypes } from './data';

/**
 * 使用tsx重构原来的template写法
 * 在大量if的情况 tsx比template的v-if好用得多
 */
export default defineComponent({
  name: 'DictTag',
  props: {
    /**
     * 字典项options
     */
    dicts: {
      required: false,
      type: Array as PropType<DictData[]>,
      default: () => [],
    },
    /**
     * 当前值
     */
    value: {
      required: true,
      type: [Number, String],
    },
    /**
     * 未匹配到字典项的fallback
     */
    fallback: {
      required: false,
      type: [String, Function] as PropType<DictFallback>,
      default: 'unknown',
    },
  },
  setup(props) {
    const color = computed<string>(() => {
      const current = props.dicts.find((item) => item.dictValue == props.value);
      const listClass = current?.listClass ?? '';
      // 是否为默认的颜色
      const isDefault = Reflect.has(tagTypes, listClass);
      // 判断是默认还是自定义颜色
      if (isDefault) {
        // 这里做了antd - element-plus的兼容
        return tagTypes[listClass]!.color;
      }
      return listClass;
    });

    const cssClass = computed<string>(() => {
      const current = props.dicts.find((item) => item.dictValue == props.value);
      return current?.cssClass ?? '';
    });

    /**
     * 返回null 走 fallback逻辑
     */
    const label = computed<null | string>(() => {
      const current = props.dicts.find((item) => item.dictValue == props.value);
      return current?.dictLabel ?? null;
    });

    const loading = computed(() => {
      return props.dicts?.length === 0;
    });

    return {
      color,
      cssClass,
      label,
      loading,
    };
  },
  render() {
    const { color, cssClass, label, loading, fallback, value, $slots } = this;

    /**
     * 字典list为0 加载中
     */
    if (loading) {
      return (
        <div>
          <Spin size="small" spinning />
        </div>
      );
    }

    /**
     * 没有匹配到字典（label === null）的fallback
     * 可为string/Vnode
     */
    if (label === null) {
      // 优先返回slot
      if ($slots.fallback) {
        return $slots.fallback(value);
      }
      // VNode / String
      if (isFunction(fallback)) {
        const rValue = fallback(value);
        if (isVNode(rValue)) {
          return h(rValue);
        }
        return <div>{rValue}</div>;
      }
      // 默认显示 unknown 文案
      if (isString(fallback)) {
        return <div>{fallback}</div>;
      }
    }

    /**
     * 有color 属性 渲染Tag
     */
    if (color) {
      return (
        <div>
          <Tag class={cssClass} color={color}>
            {label}
          </Tag>
        </div>
      );
    }

    return (
      <div>
        <div class={cssClass}>{label}</div>
      </div>
    );
  },
});
</script>
