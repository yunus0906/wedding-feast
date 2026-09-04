import type { GuestImportRow } from '~/types/guest'

const headers = ['姓名', '分类', '所属', '联系电话', '同行人数', '儿童人数', '备注']

export function parseGuestCsv(text: string): GuestImportRow[] {
  const lines = text
    .trim()
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)

  if (!lines.length) {
    return []
  }

  const rows = lines.map(line => line.split(',').map(part => part.trim()))
  const head = rows[0]
  const hasHeader = headers.every((item, index) => head[index] === item)
  const dataRows = hasHeader ? rows.slice(1) : rows

  return dataRows
    .map(([name, category, side, phone, companionCount, childrenCount, note]) => ({
      name: name || '',
      category: category || '其他',
      side: side === '女方' || side === 'bride' ? 'bride' : 'groom',
      phone: phone || '',
      companionCount: Number(companionCount || 0),
      childrenCount: Number(childrenCount || 0),
      note: note || ''
    }))
    .filter(row => row.name)
}

export function exportGuestCsv(rows: Array<Record<string, string | number>>): string {
  return [
    headers.join(','),
    ...rows.map(row =>
      [
        row.name ?? '',
        row.category ?? '',
        row.side ?? '',
        row.phone ?? '',
        row.companionCount ?? 0,
        row.childrenCount ?? 0,
        row.note ?? ''
      ]
        .map(value => String(value).replaceAll('"', '""'))
        .map(value => `"${value}"`)
        .join(',')
    )
  ].join('\n')
}
