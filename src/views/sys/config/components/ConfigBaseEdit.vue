<template>
  <el-dialog
    v-model="dialogFormVisible"
    :title="title"
    width="500px"
    @close="close"
  >
    <el-form ref="formRef" label-width="80px" :model="form" :rules="rules">
      <el-form-item :label="t('所属分类')" prop="config_type_id">
        <el-input v-model="form.config_type_id" clearable :disabled="true" :placeholder="t('所属分类')"/>
      </el-form-item>
      <el-form-item :label="t('配置编码')" prop="config_key">
        <el-input v-model="form.config_key" clearable :disabled="isUpdate" :placeholder="t('配置编码')" />
      </el-form-item>
      <el-form-item :label="t('配置标题')" prop="config_title">
        <el-input v-model="form.config_title" clearable :placeholder="t('配置标题')"/>
      </el-form-item>
      <el-form-item :label="t('配置注释')" prop="config_note">
        <el-input v-model="form.config_note" clearable :placeholder="t('配置注释')"/>
      </el-form-item>
      <el-form-item :label="t('配置类型')" prop="config_datatype">
        <el-select
          v-model="form.config_datatype"
          class="ele-block"
          clearable
          :placeholder="t('请选择配置类型')">
          <el-option :label="t('只读文本')" value="readonly"/>
          <el-option :label="t('数字')" value="number"/>
          <el-option :label="t('单行文本')" value="text"/>
          <el-option :label="t('多行文本')" value="textarea"/>
          <el-option :label="t('数组')" value="array"/>
          <el-option :label="t('密码')" value="password"/>
          <el-option :label="t('单选框')" value="radio"/>
          <el-option :label="t('复选框')" value="checkbox"/>
          <el-option :label="t('下拉框')" value="select"/>
          <el-option :label="t('字体图标')" value="icon"/>
          <el-option :label="t('日期')" value="date"/>
          <el-option :label="t('时间')" value="datetime"/>
          <el-option :label="t('单张图片')" value="image"/>
          <el-option :label="t('多张图片')" value="images"/>
          <el-option :label="t('单个文件')" value="file"/>
          <el-option :label="t('多个文件')" value="files"/>
          <el-option :label="t('富文本编辑器')" value="ueditor"/>
          <el-option :label="t('地区选择器')" value="area"/>
        </el-select>
      </el-form-item>
      <el-form-item :label="t('配置项')" prop="config_options">
        <el-input v-model="form.config_options" clearable :placeholder="t('配置项')"/>
      </el-form-item>
      <el-form-item :label="t('配置值')" prop="config_value">
        <el-input v-model="form.config_value" clearable :placeholder="t('配置值')"/>
      </el-form-item>
      <el-form-item :label="t('配置排序')" prop="config_sort">
        <el-input v-model="form.config_sort" clearable :placeholder="t('配置排序')"/>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="close">{{ t('取 消')}}</el-button>
      <el-button type="primary" @click="save">{{ t('确 定')}}</el-button>
    </template>
  </el-dialog>
</template>

<script>
import { translate as t } from '@/i18n'
import {doEdit, doAdd} from '@/api/sys/config'

export default defineComponent({
  name: 'ConfigBaseEdit',
  props:{
  },
  emits: ['fetch-data'],
  setup(props, {emit}) {
    const $message = inject('$message')

    const state = reactive({
      formRef: null,
      form: {
        roles: [],
      },
      rules: {
        title: [{required: true, trigger: 'blur', message: t('请输入标题')}],
      },
      title: '',
      dialogFormVisible: false,
      // 提交状态
      loading: false,
      // 是否是修改
      isUpdate: false,
    })

    const showEdit = (row) => {

      if (!row || (row && !row.config_key)) {
        state.isUpdate = false
        state.title = t('添加')
        state.form = Object.assign({}, row)
      } else {
        state.isUpdate = true
        state.title = t('编辑')
        state.form = Object.assign({}, row)
      }
      state.dialogFormVisible = true
    }
    const close = () => {
      state['formRef'].resetFields()
      state.form = {
        roles: [],
      }
      state.dialogFormVisible = false
    }
    const save = () => {
      state['formRef'].validate(async (valid) => {
        if (valid) {
          if (state.isUpdate) {
            const { msg, status } = await doEdit(state.form)
            if (200 == status) {
              $message(msg, 'success')
            } else {
              $message(msg, 'error')
            }
          } else {
            const { msg, status } = await doAdd(state.form)
            if (200 == status) {
              $message(msg, 'success')
            } else {
              $message(msg, 'error')
            }
          }

          emit('fetch-data')
          close()
        }
      })
    }

    return {
      t,
      ...toRefs(state),
      showEdit,
      close,
      save,
    }
  },
})
</script>
