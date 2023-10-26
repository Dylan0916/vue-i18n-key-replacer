export function useOrder() {
  const modal = reactive({});

  function openModal() {
    modal.show = true;
    modal.title = '重複預訂';
    modal.body = '已存在相同時間的訂單，是否仍要繼續預訂？';
    modal.cancelText = '查看訂單';
    modal.confirmText = '繼續預訂';
    modal.cancelOrder = '取消訂單';
  }

  return {
    openModal,
  };
}
