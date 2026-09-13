import request from '@/utils/request'
import { URL } from '@/config'

export function getList(params: any) {
  return request({
    url: URL.pay.consumeWithdraw.list,
    method: 'get',
    params,
  })
}

export function doEdit(data: any) {
  return request({
    url: URL.pay.consumeWithdraw.review || URL.pay.consumeWithdraw.edit,
    method: 'post',
    data: {
      withdraw_id: data.withdraw_id,
      withdraw_state: data.withdraw_state,
      withdraw_desc: data.withdraw_desc || data.withdraw_bankflow || '',
    },
  })
}

export function doReview(data: any) {
  return doEdit(data)
}

export function doApply(data: any) {
  return request({
    url: URL.pay.consumeWithdraw.apply,
    method: 'post',
    data,
  })
}

export function getPrepare(params: any = {}) {
  return request({
    url: URL.pay.consumeWithdraw.prepare,
    method: 'get',
    params,
  })
}
