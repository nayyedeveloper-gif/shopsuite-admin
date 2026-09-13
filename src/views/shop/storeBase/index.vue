<template>
  <div class="store-base-container">
    <ms-search-box>
      <ms-search-box-left-panel :span="12">
        <el-button type="primary" @click="loadCommission">{{ t('Commission report') }}</el-button>
      </ms-search-box-left-panel>
      <ms-search-box-right-panel :span="12">
        <el-form :inline="true" :model="queryForm" @submit.prevent>
          <el-form-item>
            <el-input v-model.trim="queryForm.store_name" clearable :placeholder="t('Store name')" />
          </el-form-item>
          <el-form-item>
            <el-select v-model="queryForm.store_state_id" clearable :placeholder="t('State')">
              <el-option :label="t('Pending review')" :value="3220" />
              <el-option :label="t('Rejected')" :value="3230" />
              <el-option :label="t('Approved')" :value="3240" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="queryData">{{ t('Query') }}</el-button>
          </el-form-item>
        </el-form>
      </ms-search-box-right-panel>
    </ms-search-box>

    <el-table v-loading="listLoading" border :data="items" :height="height">
      <el-table-column align="center" :label="t('ID')" prop="store_id" width="90" />
      <el-table-column :label="t('Name')" min-width="160" prop="store_name" show-overflow-tooltip />
      <el-table-column align="center" :label="t('Open')" width="100">
        <template #default="{ row }">
          <el-switch
            v-model="row.store_is_open"
            :disabled="row.store_state_id !== 3240"
            @change="(v) => handleOpen(row, v)"
          />
        </template>
      </el-table-column>
      <el-table-column align="center" :label="t('State')" prop="store_state_id" width="120">
        <template #default="{ row }">
          {{ stateLabel(row.store_state_id) }}
        </template>
      </el-table-column>
      <el-table-column :label="t('Remark')" min-width="140" prop="store_state_remark" show-overflow-tooltip />
      <el-table-column align="center" fixed="right" :label="t('Actions')" width="280">
        <template #default="{ row }">
          <el-button link type="primary" @click="openKyc(row)">{{ t('KYC') }}</el-button>
          <el-button v-if="row.store_state_id === 3220" link type="success" @click="handleApprove(row, true)">
            {{ t('Approve') }}
          </el-button>
          <el-button v-if="row.store_state_id === 3220" link type="danger" @click="handleApprove(row, false)">
            {{ t('Reject') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      background
      :current-page="queryForm.page"
      :layout="layout"
      :page-size="queryForm.size"
      :total="total"
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange"
    />

    <el-dialog v-model="commissionVisible" :title="t('Commission report')" width="720px">
      <el-table border :data="commissionItems">
        <el-table-column :label="t('Store')" prop="store_id" width="90" />
        <el-table-column :label="t('Name')" prop="store_name" />
        <el-table-column :label="t('Orders')" prop="order_count" width="90" />
        <el-table-column :label="t('GMV')" prop="gmv" width="110" />
        <el-table-column :label="t('Commission')" prop="commission_fee" width="110" />
        <el-table-column :label="t('Merchant net')" prop="merchant_net" width="120" />
      </el-table>
    </el-dialog>

    <el-dialog v-model="kycVisible" :title="t('Merchant KYC')" width="640px">
      <el-descriptions v-if="kycDetail" border :column="1">
        <el-descriptions-item :label="t('Store')">{{ kycDetail.store_name }} (#{{ kycDetail.store_id }})</el-descriptions-item>
        <el-descriptions-item :label="t('Company')">{{ (kycDetail.kyc && kycDetail.kyc.company_name) || '-' }}</el-descriptions-item>
        <el-descriptions-item :label="t('NRC / Biz No')">{{ (kycDetail.kyc && kycDetail.kyc.nrc_or_biz_no) || '-' }}</el-descriptions-item>
        <el-descriptions-item :label="t('Contact')">{{ (kycDetail.kyc && kycDetail.kyc.contacts_name) || '-' }} / {{ (kycDetail.kyc && kycDetail.kyc.contacts_phone) || '-' }}</el-descriptions-item>
        <el-descriptions-item :label="t('Address')">{{ (kycDetail.kyc && kycDetail.kyc.store_address) || '-' }}</el-descriptions-item>
        <el-descriptions-item :label="t('Payout')">{{ (kycDetail.kyc && kycDetail.kyc.payout_method) || '-' }}</el-descriptions-item>
        <el-descriptions-item :label="t('Wave')">{{ (kycDetail.kyc && kycDetail.kyc.wave_account) || '-' }}</el-descriptions-item>
        <el-descriptions-item :label="t('KBZPay')">{{ (kycDetail.kyc && kycDetail.kyc.kbz_account) || '-' }}</el-descriptions-item>
        <el-descriptions-item :label="t('Bank')">
          {{ (kycDetail.kyc && kycDetail.kyc.bank_name) || '-' }}
          /
          {{ (kycDetail.kyc && kycDetail.kyc.bank_account_no) || '-' }}
          /
          {{ (kycDetail.kyc && kycDetail.kyc.bank_account_name) || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('NRC doc')">
          <a v-if="kycDetail.kyc && kycDetail.kyc.doc_nrc_url" :href="kycDetail.kyc.doc_nrc_url" target="_blank">{{ t('Open') }}</a>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item :label="t('Biz license')">
          <a v-if="kycDetail.kyc && kycDetail.kyc.doc_biz_url" :href="kycDetail.kyc.doc_biz_url" target="_blank">{{ t('Open') }}</a>
          <span v-else>-</span>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="kycVisible = false">{{ t('Close') }}</el-button>
        <el-button
          v-if="kycDetail && kycDetail.store_state_id === 3220"
          type="success"
          @click="handleApprove(kycDetail, true)"
        >{{ t('Approve') }}</el-button>
        <el-button
          v-if="kycDetail && kycDetail.store_state_id === 3220"
          type="danger"
          @click="handleApprove(kycDetail, false)"
        >{{ t('Reject') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { defineComponent, inject, onMounted, reactive, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import { approve, commissionReport, editState, getList, getStore } from '@/api/shop/storeBase'

export default defineComponent({
  name: 'StoreBase',
  setup() {
    const { t } = useI18n()
    const $message = inject('$message')
    const state = reactive({
      items: [],
      listLoading: false,
      layout: 'total, sizes, prev, pager, next, jumper',
      total: 0,
      height: 'calc(100vh - 260px)',
      queryForm: { page: 1, size: 20, store_name: '', store_state_id: undefined },
      commissionVisible: false,
      commissionItems: [],
      kycVisible: false,
      kycDetail: null,
    })

    const stateLabel = (id) => {
      const map = { 3210: t('Profile'), 3220: t('Pending'), 3230: t('Rejected'), 3240: t('Approved') }
      return map[id] || id
    }

    const fetchData = async () => {
      state.listLoading = true
      try {
        const { data: { items, records } } = await getList(state.queryForm)
        state.items = items || []
        state.total = records || 0
      } finally {
        state.listLoading = false
      }
    }

    const queryData = () => {
      state.queryForm.page = 1
      fetchData()
    }

    const openKyc = async (row) => {
      const { data, status, msg } = await getStore({ store_id: row.store_id })
      if (status !== 200) {
        $message(msg || 'Failed', 'error')
        return
      }
      state.kycDetail = data
      state.kycVisible = true
    }

    const handleApprove = async (row, ok) => {
      const { status, msg } = await approve({
        store_id: row.store_id,
        approve: ok,
        store_state_remark: ok ? 'approved' : 'rejected',
      })
      $message(msg || (ok ? 'Approved' : 'Rejected'), status === 200 ? 'success' : 'error')
      if (status === 200) {
        state.kycVisible = false
        fetchData()
      }
    }

    const handleOpen = async (row, open) => {
      const { status, msg } = await editState({ store_id: row.store_id, store_is_open: open })
      if (status !== 200) {
        row.store_is_open = !open
        $message(msg || 'Failed', 'error')
      }
    }

    const loadCommission = async () => {
      const { data } = await commissionReport({ days: 30 })
      state.commissionItems = (data && data.items) || []
      state.commissionVisible = true
    }

    onMounted(fetchData)

    return {
      t,
      ...toRefs(state),
      stateLabel,
      queryData,
      fetchData,
      openKyc,
      handleApprove,
      handleOpen,
      loadCommission,
      handleSizeChange: (val) => { state.queryForm.size = val; fetchData() },
      handleCurrentChange: (val) => { state.queryForm.page = val; fetchData() },
    }
  },
})
</script>
