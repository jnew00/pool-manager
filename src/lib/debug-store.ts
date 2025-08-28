// Store for debugging upload results
let lastUploadResult: any = null

export function setLastUploadResult(result: any) {
  lastUploadResult = result
}

export function getLastUploadResult() {
  return lastUploadResult
}