export function cocokkanReceipt(receipt, submissionId) {
  if (receipt !== submissionId) {
    throw new Error('Bukti penerimaan server tidak sesuai.')
  }
  return receipt
}

export function kodeReceipt(receipt) {
  return receipt.slice(0, 8)
}
export function bolehRetry(status) {
  return status === 0 || status === 429 || status >= 500
}
