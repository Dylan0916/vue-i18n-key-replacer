<template>
  <div>
    <h3 class="text-base py-6px">登入方式</h3>
    <p>此電子信箱為綁定帳號用途，不可更改。</p>
    <p class="text-gray-80 pt-1 pb-2 mb-4">
      {{ true ? '測試文字' : '此電子信箱為綁定帳號用途，不可更改。' }}
    </p>
    <p class="text-gray-80 pt-1 pb-2 mb-4">
      {{ '此電子信箱為綁定帳號用途，不可更改。' }}
    </p>
    <template v-if="isLoginByEmail">
      <div class="flex justify-between items-center mr-2">
        <h3 class="text-base">密碼</h3>
        <h3 class="text-base">常見問題 FAQ</h3>
      </div>
      <p
        v-if="!isEditing"
        class="mb-4 py-4 text-2xl tracking-tighter border-b border-gray-40"
      >
        ●●●●●●●●●●
      </p>
      <n-form v-else class="lg:w-1/2">
        <nd-button
          class="mb-5"
          type="primary"
          :disabled="isSubmitDisabled"
          :loading="isSubmitting"
          @click="onSubmit"
          >更新密碼</nd-button
        >
      </n-form>
    </template>
  </div>
</template>

<script setup lang="ts">
import { NForm } from 'naive-ui';

const isEditing = ref(false);
const isSubmitting = ref(false);

const editText = computed(() => (isEditing.value ? '取消' : '修改密碼'));

const passwordConfig = { placeholder: '請輸入現有密碼' };
const newPasswordConfig = { placeholder: '請輸入新密碼' };
const confirmPasswordConfig = { placeholder: '請確認新密碼' };

const onSubmit = handleSubmit(async (values) => {
  try {
    isSubmitting.value = true;
    alertStore.success('已成功更新您的密碼');
  } catch (err) {
    console.error(err);
  } finally {
    isSubmitting.value = false;
  }
});
</script>
