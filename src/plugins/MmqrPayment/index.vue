<template>
  <el-dialog
    v-model="dialogVisible"
    append-to-body
    :title="t('MMQR Payment')"
    width="400px"
    @close="onClose"
  >
    <div class="mmqr-payment-dialog">
      <div v-if="loading" class="mmqr-loading">
        <el-icon class="is-loading" :size="32"><Loading /></el-icon>
        <p>{{ t('Generating QR code...') }}</p>
      </div>

      <div v-else-if="error" class="mmqr-error">
        <el-icon color="#f56c6c" :size="32"><CircleClose /></el-icon>
        <p>{{ error }}</p>
        <el-button type="primary" @click="generateQr">{{ t('Retry') }}</el-button>
      </div>

      <div v-else-if="qrString" class="mmqr-qr-container">
        <canvas ref="qrCanvas" class="mmqr-canvas"></canvas>
        <p class="mmqr-instruction">{{ t('Scan with KBZPay, Wave, or any MMQR wallet') }}</p>
        <div class="mmqr-order-info">
          <span class="mmqr-label">{{ t('Order') }}:</span>
          <span class="mmqr-value">{{ orderId }}</span>
        </div>
        <div class="mmqr-order-info">
          <span class="mmqr-label">{{ t('Amount') }}:</span>
          <span class="mmqr-value">{{ amount }} MMK</span>
        </div>
        <div class="mmqr-status">
          <el-icon v-if="paymentStatus === 'pending'" class="is-loading"><Loading /></el-icon>
          <el-icon v-else-if="paymentStatus === 'success'" color="#67c23a" :size="20"><CircleCheck /></el-icon>
          <el-icon v-else-if="paymentStatus === 'failed'" color="#f56c6c" :size="20"><CircleClose /></el-icon>
          <span class="mmqr-status-text">{{ statusText }}</span>
        </div>
        <el-button v-if="paymentStatus === 'failed'" type="primary" @click="generateQr">
          {{ t('Retry') }}
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onUnmounted } from 'vue'
import { Loading, CircleCheck, CircleClose } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import QRCode from 'qrcode'
import { doMmpayPay, doMmqrPay } from '@/api/pay/consumeDeposit'

const { t } = useI18n()

const props = defineProps<{
  modelValue: boolean
  orderId: string
  amount: number
  useGateway?: boolean // true = MMPay gateway, false = local MMQR
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
  (e: 'failed'): void
}>()

const dialogVisible = ref(props.modelValue)
const loading = ref(false)
const error = ref('')
const qrString = ref('')
const qrCanvas = ref<HTMLCanvasElement>()
const paymentStatus = ref<'idle' | 'pending' | 'success' | 'failed'>('idle')
let pollTimer: ReturnType<typeof setInterval> | null = null

const statusText = ref('')

watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
  if (val) {
    generateQr()
  }
})

watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

async function generateQr() {
  loading.value = true
  error.value = ''
  qrString.value = ''
  paymentStatus.value = 'idle'
  statusText.value = t('Generating QR code...')

  try {
    const reqData = {
      order_id: [props.orderId],
      payment_channel_id: 1432,
      deposit_payment_type: 1302,
    }

    let res: any
    if (props.useGateway) {
      res = await doMmpayPay(reqData)
    } else {
      res = await doMmqrPay(reqData)
    }

    if (res.data && res.data.qr_string) {
      qrString.value = res.data.qr_string
      loading.value = false
      paymentStatus.value = 'pending'
      statusText.value = t('Waiting for payment...')
      await nextTick()
      renderQr()
      startPolling()
    } else {
      throw new Error(res.data?.message || t('Failed to generate QR code'))
    }
  } catch (err: any) {
    loading.value = false
    error.value = err.message || t('Failed to generate QR code')
    paymentStatus.value = 'failed'
    statusText.value = t('Payment failed')
  }
}

async function renderQr() {
  if (!qrCanvas.value || !qrString.value) return
  try {
    await QRCode.toCanvas(qrCanvas.value, qrString.value, {
      width: 256,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    })
  } catch (err) {
    console.error('QR render error:', err)
  }
}

function startPolling() {
  stopPolling()
  // Poll order payment status every 3 seconds
  pollTimer = setInterval(async () => {
    await checkPaymentStatus()
  }, 3000)
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

async function checkPaymentStatus() {
  // In a real implementation, this would call an API to check order payment status
  // For now, we rely on the webhook updating the order status server-side
  // The frontend would poll: GET /front/pay/consumeDeposit/status?orderId=xxx
  // If the webhook has processed, the order status would be "SUCCESS"
  //
  // TODO: implement status check API endpoint
  // For now, this is a placeholder that the user can extend
}

function onClose() {
  stopPolling()
  emit('update:modelValue', false)
}

onUnmounted(() => {
  stopPolling()
})
</script>

<style scoped>
.mmqr-payment-dialog {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
}

.mmqr-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 0;
}

.mmqr-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 0;
}

.mmqr-qr-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.mmqr-canvas {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.mmqr-instruction {
  font-size: 14px;
  color: #606266;
  text-align: center;
}

.mmqr-order-info {
  display: flex;
  gap: 8px;
  font-size: 13px;
}

.mmqr-label {
  color: #909399;
}

.mmqr-value {
  color: #303133;
  font-weight: 500;
}

.mmqr-status {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 4px;
  background: #f5f7fa;
}

.mmqr-status-text {
  font-size: 13px;
  color: #606266;
}
</style>
