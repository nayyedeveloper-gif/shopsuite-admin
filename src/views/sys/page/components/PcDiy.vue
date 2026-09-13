<template>
  <el-dialog
    v-model="dialogFormVisible"
    class="page_pc_diy_dialog"
    :fullscreen="true"
    :title="title"
    top="2%"
    width="80%"
    @close="close"
  >
    <iframe
      class="placeholder"
      frameborder="0"
      scrolling="auto"
      :src="iframeSrc"
      style="width: 100%; height: 770px"
    ></iframe>
    <template #footer>
      <el-button @click="close">{{ t('确定')}}</el-button>
    </template>
  </el-dialog>
</template>

<script>
  import { computed, defineComponent, reactive, toRefs } from 'vue'
  import { translate as t } from '@/i18n'
  import { URL } from '@/config'

  export default defineComponent({
    name: 'PcDiy',
    setup() {
      const state = reactive({
        dialogFormVisible: false,
        page_id: '',
        title: t('装修'),
        URL,
      })

      // Absolute path required: page route is also /diy-pc, so relative
      // "diy-pc/index.html" would resolve to /diy-pc/diy-pc/index.html
      const iframeSrc = computed(() => {
        if (!state.dialogFormVisible || !state.page_id) return 'about:blank'
        const q = new URLSearchParams({
          page_id: String(state.page_id),
          api_url: URL.apiUrl || '',
          admin_url: URL.adminUrl || '',
        })
        return `/diy-pc/index.html?${q.toString()}`
      })

      const showDiy = (row) => {
        state.title = (row && row.page_name) ? `${t('装修')} - ${row.page_name}` : t('装修')
        state.page_id = row && row.page_id != null ? row.page_id : ''
        state.dialogFormVisible = true
      }
      const close = () => {
        state.dialogFormVisible = false
        state.page_id = ''
      }

      return {
        t,
        ...toRefs(state),
        iframeSrc,
        showDiy,
        close,
      }
    },
  })
</script>
<style lang="scss">
  .el-input__wrapper{
    width: 100%;
  }
</style>
