<!--抄送组件-->
<script setup lang="ts">
import type { PropType } from 'vue';

import type { User } from '#/api/system/user/model';

import { computed } from 'vue';

import { useVbenModal, VbenAvatar } from '@vben/common-ui';

import { Avatar, AvatarGroup, Tooltip } from 'ant-design-vue';

import { userSelectModal } from '.';

defineOptions({
  name: 'CopyComponent',
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<{ allowUserIds?: string; ellipseNumber?: number }>(),
  {
    /**
     * 最大显示的头像数量 超过显示为省略号头像
     */
    ellipseNumber: 3,
    /**
     * 允许选择允许选择的人员ID 会当做参数拼接在uselist接口
     */
    allowUserIds: '',
  },
);

const emit = defineEmits<{ cancel: []; finish: [User[]] }>();

const [UserSelectModal, modalApi] = useVbenModal({
  connectedComponent: userSelectModal,
});

const userListModel = defineModel('userList', {
  type: Array as PropType<User[]>,
  default: () => [],
});

function handleOpen() {
  modalApi.setData({ userList: userListModel.value });
  modalApi.open();
}

function handleFinish(userList: User[]) {
  // 清空 直接赋值[]会丢失响应性
  userListModel.value.splice(0);
  userListModel.value.push(...userList);
  emit('finish', userList);
}

const displayedList = computed(() => {
  return userListModel.value.slice(0, props.ellipseNumber);
});
</script>

<template>
  <div class="flex items-center gap-2">
    <AvatarGroup v-if="userListModel.length > 0">
      <Tooltip
        v-for="user in displayedList"
        :key="user.userId"
        :title="user.nickName"
        placement="top"
      >
        <div>
          <VbenAvatar
            :alt="user?.nickName ?? ''"
            class="bg-primary size-[36px] cursor-pointer rounded-full border text-white"
            src=""
          />
        </div>
      </Tooltip>
      <Tooltip
        :title="`等${userListModel.length - props.ellipseNumber}人`"
        placement="top"
      >
        <Avatar
          v-if="userListModel.length > ellipseNumber"
          class="flex size-[36px] cursor-pointer items-center justify-center rounded-full border bg-[gray] text-white"
        >
          +{{ userListModel.length - props.ellipseNumber }}
        </Avatar>
      </Tooltip>
    </AvatarGroup>
    <a-button size="small" @click="handleOpen">选择人员</a-button>
    <UserSelectModal
      :allow-user-ids="allowUserIds"
      @cancel="$emit('cancel')"
      @finish="handleFinish"
    />
  </div>
</template>
