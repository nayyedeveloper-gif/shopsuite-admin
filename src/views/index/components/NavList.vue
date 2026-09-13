<template>
  <el-col :span="24">
    <el-card class="nav-list-card" shadow="never">
      <template #header>
        <span>{{ t('快捷入口') }}</span>
      </template>
      <el-row :gutter="12">
        <el-col
          v-for="(item, index) in iconList"
          :key="index"
          :lg="3"
          :md="6"
          :sm="6"
          :xl="3"
          :xs="12"
        >
          <ms-link :to="item.link">
            <div class="icon-panel">
              <ms-icon :icon="item.icon" :style="{ color: item.color }" />
              <p>{{ item.title }}</p>
            </div>
          </ms-link>
        </el-col>
      </el-row>
    </el-card>
  </el-col>
</template>

<script>
  import { defineComponent, inject } from 'vue'
  import { useRouter } from 'vue-router'
  import { translate as t } from '@/i18n'

  export default defineComponent({
    name: 'NavList',
    setup() {
      const $pub = inject('$pub')
      const router = useRouter()

      const iconList = [
        { icon: 'user-3-line', title: t('用户管理'), link: '/userInfo', color: '#95de64' },
        { icon: 'settings-4-line', title: t('系统设置'), link: '/site/1001', color: '#69c0ff' },
        { icon: 'product-hunt-line', title: t('商品'), link: '/productBase', color: '#ffd666' },
        { icon: 'list-unordered', title: t('订单管理'), link: '/orderBase', color: '#1890FF' },
        { icon: 'message-line', title: t('消息配置'), link: '/messageTemplate', color: '#ffc069' },
        { icon: 'table-line', title: t('文章管理'), link: '/articleBase', color: '#5cdbd3' },
        { icon: 'code-box-line', title: t('首页装修'), link: '/diy-mobile', color: '#b37feb' },
        { icon: 'file-paper-line', title: t('优惠券'), link: '/activityBase/voucher', color: '#ff85c0' },
      ]

      const changeTheme = () => {
        $pub('theme')
      }

      const goToPath = (path, query) => {
        router.push({ path: path, query: query })
      }

      return {
        t,
        iconList,
        changeTheme,
        goToPath,
      }
    },
  })
</script>

<style lang="scss" scoped>
  .nav-list-card {
    margin-bottom: 16px;

    :deep(.el-card__header) {
      padding: 12px 16px;
      font-weight: 600;
    }

    :deep(.el-card__body) {
      padding: 12px 16px 4px;
    }
  }

  .icon-panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 96px;
    margin-bottom: 12px;
    text-align: center;
    cursor: pointer;
    background: var(--el-fill-color-blank, #fff);
    border: 1px solid var(--el-border-color-lighter, #ebeef5);
    border-radius: 8px;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;

    &:hover {
      border-color: var(--el-color-primary-light-5);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

      i {
        transform: scale(1.08);
      }
    }

    i {
      display: block;
      font-size: 28px;
      line-height: 1;
      transition: transform 0.2s ease;
    }

    p {
      width: 100%;
      margin: 10px 0 0;
      padding: 0 6px;
      overflow: hidden;
      font-size: 13px;
      line-height: 1.2;
      color: var(--el-text-color-regular);
      text-align: center;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
</style>
