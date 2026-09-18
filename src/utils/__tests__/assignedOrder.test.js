import { describe, it, expect } from 'vitest'
import { compareAssignedOrder } from '../supabase'

const row = (id, sort_order, assigned_date) => ({ id, sort_order, assigned_date })

describe('compareAssignedOrder', () => {
  it('puts hand-placed rows in their dragged order', () => {
    const rows = [row('c', 2, '2026-09-01'), row('a', 0, '2026-09-03'), row('b', 1, '2026-09-02')]
    expect([...rows].sort(compareAssignedOrder).map(r => r.id)).toEqual(['a', 'b', 'c'])
  })

  it('sorts untouched rows newest first, after the placed ones', () => {
    const rows = [
      row('new-old', null, '2026-09-01'),
      row('placed', 0, '2026-08-01'),
      row('new-recent', null, '2026-09-05'),
    ]
    expect([...rows].sort(compareAssignedOrder).map(r => r.id))
      .toEqual(['placed', 'new-recent', 'new-old'])
  })

  it('treats sort_order 0 as placed, not missing', () => {
    expect(compareAssignedOrder(row('a', 0, '2026-01-01'), row('b', null, '2026-12-31'))).toBeLessThan(0)
  })
})
