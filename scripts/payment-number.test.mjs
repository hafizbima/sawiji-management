import assert from 'node:assert/strict'
import test from 'node:test'
import { nextPaymentNumber } from '../src/lib/payment-number.ts'

const payments = (...numbers) => numbers.map(nomor => ({ nomor }))

test('penghapusan transaksi di tengah tidak menyebabkan nomor duplikat', () => {
  const existing = payments('SWJ-20260910-001', 'SWJ-20260910-003')
  const next = nextPaymentNumber('2026-09-10', existing)
  assert.equal(next, 'SWJ-20260910-004')
  existing.push({ nomor: next })
  assert.equal(nextPaymentNumber('2026-09-10', existing), 'SWJ-20260910-005')
})

test('tanggal baru dimulai dari 001, termasuk transaksi bertanggal mundur', () => {
  assert.equal(nextPaymentNumber('2026-09-09', payments('SWJ-20260910-099')), 'SWJ-20260909-001')
  assert.equal(nextPaymentNumber('2026-09-10', []), 'SWJ-20260910-001')
})

test('urutan dibandingkan secara numerik dan dapat melewati 999', () => {
  assert.equal(nextPaymentNumber('2026-09-10', payments(
    'SWJ-20260910-1000', 'SWJ-20260910-009', 'SWJ-20260910-999',
  )), 'SWJ-20260910-1001')
})
