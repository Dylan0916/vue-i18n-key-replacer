export const ORDER_OPTIONS = [
  {
    label: '熱門',
  },
  {
    label: '距離',
  },
  {
    label: '價格低到高',
  },
  {
    label: '價格高到低',
  },
];

export async function useSearchFilter() {
  const layout = computed(() => [
    [
      {
        label: '地區',
        icon: 'location-hollow',
      },
    ],
    [
      {
        label: '年齡',
        icon: 'age',
      },
    ],
    {
      label: '日期',
      icon: 'calendar',
    },
    {
      label: '價格',
      icon: 'money',
    },
  ]);

  return {
    layout,
  };
}
