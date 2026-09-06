import type { GuestCategory, GuestImportRow } from '~/types/guest'

const headers = ['姓名', '分类', '所属', '联系电话', '同行人', '儿童人数', '关系标签', '备注']
const categories: GuestCategory[] = ['亲戚', '好友', '同学']

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
    .map(([name, category, side, phone, companions, childrenCount, relationTag, note]) => ({
      name: name || '',
      category: categories.includes(category as GuestCategory) ? category as GuestCategory : '亲戚',
      side: side === '女方' || side === 'bride' ? 'bride' : 'groom',
      phone: phone || '',
      companions: companions || '',
      childrenCount: Number(childrenCount || 0),
      relationTag: relationTag || '',
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
        row.companions ?? '',
        row.childrenCount ?? 0,
        row.relationTag ?? '',
        row.note ?? ''
      ]
        .map(value => String(value).replaceAll('"', '""'))
        .map(value => `"${value}"`)
        .join(',')
    )
  ].join('\n')
}
