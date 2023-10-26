<template>
  <div id="branch-page" class="bg-gray-20 pt-6 pb-10 text-base">
    <div class="container mx-auto">
      <div class="hero relative rounded overflow-hidden">
        <nd-img
          :src="`fn:${branch?.cover_image}`"
          class="w-full object-cover aspect-1.8 sm:(aspect-unset h-300px)"
        />
        <div
          class="mask absolute top-0 left-0 w-full h-full text-white p-5 flex flex-col justify-end gap-1"
        >
          <div class="branch-name flex items-center gap-1">
            <h2 class="text-2xl">{{ branch?.name }}</h2>
            <favorite-button
              text="店家資訊"
              v-if="!app.isMobile"
              :is-favorited="branch?.is_favorite || false"
            />
          </div>
          <div v-show="branch?.distance" class="distance">
            距離 {{ branch?.distance }} km
          </div>
          <favorite-button
            v-if="app.isMobile"
            class="absolute top-2 right-2"
            :is-favorited="branch?.is_favorite || false"
          />
        </div>
      </div>
      <div
        class="main-content flex flex-col gap-2 mt-2 md:(flex-row gap-6 mt-6)"
      >
        <div class="left-side flex-1">
          <div class="branch-info card !px-0">
            <h3 class="title px-5">店家資訊</h3>
            <div
              class="address py-4 px-5 flex justify-between items-center gap-2"
            >
              <span>{{ branch?.address }}</span>
              <map-button
                :target="`${branch?.area}${branch?.address}`"
                :latitude="branch?.lat"
                :longitude="branch?.lng"
              />
            </div>
            <hr />
            <template v-if="branch?.opening_hours">
              <nd-collapse
                class="opening-hour"
                :list="addressCollapseData"
                content-class="whitespace-pre-wrap"
              ></nd-collapse>
            </template>
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
            <div
              class="product-grid grid grid-cols-1 xl:grid-cols-2 gap-5 py-4"
            >
              <product-card
                v-for="product in displayedBranchProducts"
                :key="product.product_id"
                :product="product"
                class="w-full"
              />
            </div>
            <div
              v-if="isLoadMoreProductsBtnShown"
              class="flex justify-center mt-4"
            >
              <nd-button
                v-if="!isDisplayAllProducts"
                type="text"
                class="active"
                @click="isDisplayAllProducts = true"
                >顯示更多商品</nd-button
              >
              <nd-button
                v-else
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
import { useAppStore } from '@/store/app';
import { useRegionStore } from '@/store/region';

import { getProducts } from '@/service/product';
import { getBranch } from '@/service/branch';

import FavoriteButton from '@/components/common/favorite-button.vue';
import MapButton from '@/components/branch/branch-detail/map-button.vue';
import ProductCard from '@/components/product/product-card.vue';
import CollapsibleArticle from '@/components/common/collapsible-article.vue';

import { SortRuleEnum } from '@/types/product';

const route = useRoute();
const app = useAppStore();
const regionStore = useRegionStore();

const branchId = computed(() => route.params.bid);
const regionId = computed(() => regionStore.region.region_id);

const branchQueryParams = computed(() => ({
  ...(app.geolocation.locatedAt
    ? {
        lat: app.geolocation.latitude,
        lng: app.geolocation.longitude,
      }
    : {}),
}));

const { data: branch } = await useAsyncData(
  `branch_${branchId.value}`,
  async () => {
    const { data } = await getBranch(branchId.value, branchQueryParams.value);
    return data;
  },
  { watch: [branchId, branchQueryParams] }
);

const { data: branchProducts } = await useAsyncData(
  `branch_${branchId.value}_products`,
  async () => {
    if (!regionId.value) return [];

    const { data: branchProducts } = await getProducts({
      filter_regionid: regionId.value,
      filter_bid: `${branchId.value || ''}`,
      sortby: SortRuleEnum.Popular,
      size: 9999,
    });
    return branchProducts;
  },
  { watch: [branchId] }
);
const isDisplayAllProducts = ref(false);
const isLoadMoreProductsBtnShown = computed(() => {
  if (!branchProducts.value) return false;
  return branchProducts.value.length > 8;
});
const displayedBranchProducts = computed(() => {
  if (!branchProducts.value) return [];
  if (isDisplayAllProducts.value) return branchProducts.value;
  return branchProducts.value.slice(0, 8);
});

const addressCollapseData = computed(() => {
  if (!branch.value) return [];

  return [
    {
      title: '營業時間',
      content: branch.value.opening_hours,
    },
  ];
});
</script>

<style lang="scss">
#branch-page {
  .hero {
    .mask {
      background: linear-gradient(
        180deg,
        rgba(0, 0, 0, 0.16) 0%,
        rgba(0, 0, 0, 0.4) 100%
      );
    }
  }
  .card {
    @apply bg-white rounded py-0 md:py-4 px-5;
  }
  .title {
    @apply text-xl font-500 py-3;
  }
}
</style>
