<template>
  <el-dialog v-model="visible" :title="t('Apply withdraw')" width="520px" @close="close">
    <el-alert
      :closable="false"
      show-icon
      style="margin-bottom: 16px"
      :title="`${t('Available')}: ${available} ${currencySymbol} · ${t('Frozen')}: ${frozen} ${currencySymbol}`"
      type="info"
    />
    <el-form ref="formRef" label-width="130px" :model="form" :rules="rules">
      <el-form-item :label="`${t('Amount')} (${currencySymbol})`" prop="withdraw_amount">
        <el-input-number
          v-model="form.withdraw_amount"
          :max="available > 0 ? available : undefined"
          :min="1"
          :precision="2"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item :label="t('Payout method')" prop="payout_method">
        <el-select v-model="form.payout_method" style="width: 100%" @change="onMethodChange">
          <el-option
            v-for="m in payoutMethods"
            :key="m.code"
            :label="m.label"
            :value="m.code"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="t('Channel / bank')" prop="withdraw_bank">
        <el-input v-model="form.withdraw_bank" clearable />
      </el-form-item>
      <el-form-item :label="t('Account No')" prop="withdraw_account_no">
        <el-input v-model="form.withdraw_account_no" clearable />
      </el-form-item>
      <el-form-item :label="t('Account name')" prop="withdraw_account_name">
        <el-input v-model="form.withdraw_account_name" clearable />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="close">{{ t('Cancel') }}</el-button>
      <el-button :loading="loading" type="primary" @click="save">{{ t('Submit') }}</el-button>
    </template>
  </el-dialog>
</template>

<script>
import { defineComponent, inject, reactive, toRefs } from 'vue'
import { translate as t } from '@/i18n'
import { doApply, getPrepare } from '@/api/pay/consumeWithdraw'

export default defineComponent({
  name: 'ConsumeWithdrawApply',
  emits: ['fetch-data'],
  setup(props, { emit }) {
    const $message = inject('$message')
    const state = reactive({
      formRef: null,
      visible: false,
      loading: false,
      available: 0,
      frozen: 0,
      currencySymbol: '',
      payoutMethods: [],
      kyc: null,
      form: {
        withdraw_amount: undefined,
        payout_method: '',
        withdraw_bank: '',
        withdraw_account_no: '',
        withdraw_account_name: '',
      },
    })

    const rules = {
      withdraw_amount: [{ required: true, message: t('Amount required'), trigger: 'change' }],
      withdraw_account_no: [{ required: true, message: t('Account required'), trigger: 'blur' }],
      withdraw_account_name: [{ required: true, message: t('Name required'), trigger: 'blur' }],
    }

    const applyKycToForm = (method) => {
      const k = state.kyc || {}
      const methods = state.payoutMethods || []
      const m = method || k.payout_method || (methods[0] && methods[0].code) || ''
      const meta = methods.find((x) => x.code === m) || { code: m, label: m }
      state.form.payout_method = m
      if (m === 'wave') {
        state.form.withdraw_bank = meta.label || m
        state.form.withdraw_account_no = k.wave_account || ''
        state.form.withdraw_account_name = k.company_name || ''
      } else if (m === 'kbz') {
        state.form.withdraw_bank = meta.label || m
        state.form.withdraw_account_no = k.kbz_account || ''
        state.form.withdraw_account_name = k.company_name || ''
      } else if (m === 'bank') {
        state.form.withdraw_bank = k.bank_name || meta.label || m
        state.form.withdraw_account_no = k.bank_account_no || ''
        state.form.withdraw_account_name = k.bank_account_name || k.company_name || ''
      } else {
        state.form.withdraw_bank = meta.label || m
        state.form.withdraw_account_no = ''
        state.form.withdraw_account_name = k.company_name || ''
      }
    }

    const onMethodChange = (v) => {
      applyKycToForm(v)
    }

    const show = async () => {
      state.form.withdraw_amount = undefined
      state.available = 0
      state.frozen = 0
      state.kyc = null
      state.payoutMethods = []
      state.currencySymbol = ''
      try {
        const { data, status } = await getPrepare()
        if (status === 200 && data) {
          state.available = Number(data.user_money) || 0
          state.frozen = Number(data.user_money_frozen) || 0
          state.currencySymbol = data.currency_symbol || ''
          state.payoutMethods = data.payout_methods || []
          state.kyc = data
          applyKycToForm(data.payout_method || (state.payoutMethods[0] && state.payoutMethods[0].code))
        }
      } catch (e) {
        $message(t('Failed to load withdraw options'), 'error')
      }
      state.visible = true
    }

    const close = () => {
      state.visible = false
    }

    const save = () => {
      state.formRef.validate(async (valid) => {
        if (!valid) return
        if (state.available > 0 && state.form.withdraw_amount > state.available) {
          $message(t('Insufficient balance'), 'error')
          return
        }
        state.loading = true
        try {
          const { status, msg } = await doApply({
            withdraw_amount: state.form.withdraw_amount,
            withdraw_bank: state.form.withdraw_bank,
            withdraw_account_no: state.form.withdraw_account_no,
            withdraw_account_name: state.form.withdraw_account_name,
          })
          $message(msg || (status === 200 ? 'OK' : 'Failed'), status === 200 ? 'success' : 'error')
          if (status === 200) {
            emit('fetch-data')
            close()
          }
        } finally {
          state.loading = false
        }
      })
    }

    return { t, ...toRefs(state), rules, onMethodChange, show, close, save }
  },
})
</script>
