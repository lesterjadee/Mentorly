export function uniqueRealtimeTopic(prefix: string, userId: string) {
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2)

  return prefix + '-' + userId + '-' + id
}
