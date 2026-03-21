import { defineComponent, h, ref } from 'vue';

import { Modal } from 'ant-design-vue';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';

import ApprovalContent from './approval-content.vue';

export interface ApproveWithReasonModalProps {
  title: string;
  description: string;
  onOk: (reason: string) => void;
}

/**
 * 带审批意见的confirm
 * @param props props
 */
export function approveWithReasonModal(props: ApproveWithReasonModalProps) {
  const { onOk, title, description } = props;
  const content = ref('');
  Modal.confirm({
    title,
    content: h(
      defineComponent({
        setup() {
          return () =>
            h(ApprovalContent, {
              description,
              value: content.value,
              'onUpdate:value': (v) => (content.value = v),
            });
        },
      }),
    ),
    centered: true,
    okButtonProps: { danger: true },
    onOk: () => onOk(content.value),
  });
}

dayjs.extend(duration);
dayjs.extend(relativeTime);
/**
 * 计算相差的时间
 * @param dateTime 时间字符串
 * @returns 相差的时间
 */
export function getDiffTimeString(dateTime: string) {
  // 计算相差秒数
  const diffSeconds = dayjs().diff(dayjs(dateTime), 'second');
  /**
   * 转为时间显示(x月 x天)
   * https://dayjs.fenxianglu.cn/category/duration.html#%E4%BA%BA%E6%80%A7%E5%8C%96
   *
   */
  const diffText = dayjs.duration(diffSeconds, 'seconds').humanize();
  return diffText;
}
