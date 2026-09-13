import request from '@/utils/request'
import { URL } from '@/config'

export function getList(params) {
  return request({ url: URL.shop.storeBase.list, method: 'get', params })
}

export function getStore(params) {
  return request({ url: URL.shop.storeBase.get, method: 'get', params })
}

export function approve(data) {
  return request({ url: URL.shop.storeBase.approve, method: 'post', data })
}

export function editState(data) {
  return request({ url: URL.shop.storeBase.editState, method: 'post', data })
}

export function commissionReport(params) {
  return request({ url: URL.shop.storeBase.commissionReport, method: 'get', params })
}
