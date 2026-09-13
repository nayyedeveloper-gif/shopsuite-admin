<template>
  <ms-card class="top-card" :class="'top-card-' + background" shadow="hover">
    <span>{{ title }}</span>
    <span style="float:right; margin-right: 4px;"><el-tag size="small" type="success">{{ t("今日")}}</el-tag></span>
    <p>
      <ms-count
        :decimals="countConfig.decimals"
        :duration="countConfig.duration"
        :end-val="countConfig.today"
        :prefix="countConfig.prefix"
        :separator="countConfig.separator"
        :start-val="countConfig.startVal"
        :suffix="countConfig.suffix"
      />
    </p>
    <div class="right-icon">
      <ms-icon :icon="icon" />
    </div>

    <div class="bottom">
      <span class="bottom-left">
        {{ t("昨日") }}
        {{ countConfig.prefix }}{{ countConfig.yestoday != null && countConfig.yestoday !== '' ? countConfig.yestoday : "—" }}
        <template v-if="countConfig.daym2m != null && countConfig.daym2m !== ''">
          <span class="m2m">{{ formatDaym2m(countConfig.daym2m) }}</span>
          <ms-icon v-if="Number(countConfig.daym2m) > 0" icon="arrow-up-line" />
          <ms-icon v-else icon="arrow-down-line" />
        </template>
        <template v-else>
          <span class="m2m">—</span>
        </template>
      </span>
      <span class="bottom-right">
        {{ t("本月") }}
        {{ countConfig.prefix }}{{ countConfig.month != null && countConfig.month !== '' ? countConfig.month : "—" }}
      </span>
    </div>

    <div v-if="false" class="bottom">
      {{ bottomText }}
      <div style="float: right">{{ countConfig.month }}{{ unitText }}</div>
    </div>
  </ms-card>
</template>

<script>
import {translate as t} from '@/i18n'
  import MsCount from '@/plugins/MsCount'

  export default defineComponent({
    name: 'TopCard',
    components: {
      MsCount,
    },
    props: {
      background: {
        type: String,
        default: 'white',
      },
      title: {
        type: String,
        default: '',
      },
      icon: {
        type: String,
        default: 'album-line',
      },
      bottomText: {
        type: String,
        default: '',
      },
      unitText: {
        type: String,
        default: '',
      },
      countConfig: {
        type: Object,
        default: () => {
          return {
            startVal: 0,
            endVal: 0,
            today: 0,
            yestoday: null,
            month: null,
            daym2m: null,
            decimals: 0,
            prefix: '',
            suffix: '',
            separator: ',',
            duration: 800,
          }
        },
      },
    },
    setup() {
      const state = reactive({})

      const formatDaym2m = (val) => {
        const n = Number(val)
        if (Number.isNaN(n)) return '—'
        return `${n.toFixed(0)}%`
      }

      return {
        t,
        formatDaym2m,
        ...toRefs(state),
      }
    },
  })
</script>

<style lang="scss" scoped>
  .top-card {
    position: relative;
    height: 148px !important;
    margin-bottom: 16px;

    p {
      margin: 8px 0 0;
      font-size: 28px;
      line-height: 1.2;
    }

    .right-icon {
      position: absolute;
      top: 50%;
      right: 20px;
      width: 50px;
      height: 50px;
      line-height: 50px;
      color: var(--el-color-primary);
      text-align: center;
      background: var(--el-color-primary-light-9);
      border-radius: 50%;
      transform: translateY(-50%);

      i {
        font-size: 30px;
      }
    }

    .bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-top: 18px;
      font-size: 12px;
      line-height: 18px;
      color: var(--el-text-color-secondary);

      .bottom-left,
      .bottom-right {
        display: inline-flex;
        align-items: center;
        min-width: 0;
      }

      .m2m {
        margin-left: 6px;
      }

      .ri-arrow-up-line {
        width: 18px;
        height: 18px;
        margin: 0 3px 0 2px;
        color: var(--el-color-error);
        vertical-align: -3px !important;
        background: var(--el-color-error-light);
        border-radius: 50%;
        transform: scale(0.8);
      }

      .ri-arrow-down-line {
        width: 18px;
        height: 18px;
        margin: 0 3px 0 2px;
        color: var(--el-color-success);
        vertical-align: -3px !important;
        background: var(--el-color-success-light);
        border-radius: 50%;
        transform: scale(0.8);
      }
    }

    &-blue {
      color: #fff;
      background: var(--el-color-primary);
      background: linear-gradient(
        90deg,
        var(--el-color-primary-light-4),
        var(--el-color-primary)
      );

      .bottom {
        font-size: 12px;

        .ri-arrow-up-line {
          color: #fff;
          background: transparent;
        }

        .ri-arrow-up-line {
          color: var(--el-color-primary);
          background: var(--el-color-primary-light-9);
          transform: scale(0.8);
        }

        span {
          color: #fff;
        }
      }
    }
  }
</style>
