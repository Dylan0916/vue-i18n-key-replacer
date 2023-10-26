<template>
  <div id="branch-page" class="bg-gray-20 pt-6 pb-10 text-base">
    <div class="container mx-auto">
      <div class="hero relative rounded overflow-hidden">
        <div
          class="mask absolute top-0 left-0 w-full h-full text-white p-5 flex flex-col justify-end gap-1"
        >
          <div v-show="branch?.distance" class="distance">
            距離 {{ branch?.distance }} km
          </div>
        </div>
      </div>
      <div
        class="main-content flex flex-col gap-2 mt-2 md:(flex-row gap-6 mt-6)"
      >
        <div class="left-side flex-1">
          <div class="branch-info card !px-0">
            <h3 class="title px-5">店家資訊</h3>
            <hr />
            <hr v-if="branch?.opening_hours && branch?.intro" />
            <template v-if="branch?.intro">
              <h4 class="text-lg py-4 px-5">店家特色</h4>
              <collapsible-article
                class="text-article"
                expand-btn-text="顯示更多介紹"
              >
                <div class="px-5" v-html="branch?.intro"></div>
              </collapsible-article>
            </template>
          </div>
        </div>

        <div class="right-side w-full md:w-386px xl:w-712px">
          <div class="branch-product-list card">
            <h3 class="title">熱門商品</h3>
            <div class="flex justify-center mt-4">
              <nd-button type="text" class="active">顯示更多商品</nd-button>
              <nd-button
                type="text"
                class="active"
                @click="isDisplayAllProducts = false"
                >顯示部分商品</nd-button
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CollapsibleArticle from '@/components/common/collapsible-article.vue';

const addressCollapseData = computed(() => {
  return [
    {
      title: '營業時間',
    },
  ];
});
</script>

<style lang="scss"></style>
