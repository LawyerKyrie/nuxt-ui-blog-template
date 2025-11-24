const rows = [
  {
    id: '100',
    date: '2024-03-11T15:30:00',
    status: 'paid',
    links: 'james.anderson@example.com',
    pages: 594
  },
  {
    id: '099',
    date: '2024-03-11T10:10:00',
    status: 'failed',
    links: 'mia.white@example.com',
    pages: 276
  },
  {
    id: '098',
    date: '2024-03-11T08:50:00',
    status: 'refunded',
    links: 'william.brown@example.com',
    pages: 315
  },
  {
    id: '097',
    date: '2024-03-10T19:45:00',
    status: 'paid',
    links: 'emma.davis@example.com',
    pages: 529
  },
  {
    id: '096',
    date: '2024-03-10T15:55:00',
    status: 'paid',
    links: 'ethan.harris@example.com',
    pages: 639
  }
]
export default defineEventHandler(() => {
  return rows
})
