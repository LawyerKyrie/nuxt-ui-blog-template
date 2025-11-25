<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import { upperFirst } from 'scule' /* Visibility */
import type { ContextMenuItem, TableColumn, TableRow } from '@nuxt/ui'
import type { Column, Row } from '@tanstack/vue-table'
import { useClipboard /* useInfiniteScroll */ } from '@vueuse/core'

const toast = useToast()
const { copy } = useClipboard()

const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')

const { data: page } = await useAsyncData('searching', () => queryCollection('searching').first())

const title = page.value?.seo?.title || page.value?.title
const description = page.value?.seo?.description || page.value?.description

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description
})

type RowCells = {
  id: string
  date: string
  status: 'paid' | 'failed' | 'refunded'
  links: string
  pages: number
}

const { data: rows, pending } = await useFetch<RowCells[]>(
  '/api/table-rows',
  { /* the following line isn't in use, and can be deleted
    key: 'table-rows',
    transform: (data) => {
      return (data?.map(row => ({ ...row })) || [])
    } // server: false, lazy: true, immediate: false */
  }
)

const columns: TableColumn<RowCells>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => getHeader(column, '#'),
    cell: ({ row }) => `#${row.getValue('id')}`
  },
  {
    accessorKey: 'date',
    header: ({ column }) => getHeader(column, 'Date'),
    cell: ({ row }) => {
      return new Date(row.getValue('date')).toLocaleString('en-US', {
        day: 'numeric',
        month: 'short',
        year: '2-digit'
      })
    }
  },
  {
    accessorKey: 'status',
    header: ({ column }) => getHeader(column, 'Status'),
    cell: ({ row }) => {
      const color = {
        paid: 'success' as const,
        failed: 'error' as const,
        refunded: 'neutral' as const
      }[row.getValue('status') as string]

      return h(UBadge, { class: 'capitalize', variant: 'subtle', color }, () =>
        row.getValue('status')
      )
    }
  },
  {
    accessorKey: 'links',
    header: ({ column }) => getHeader(column, 'Links'),
    meta: {
      class: {
        td: 'w-full'
      }
    },
    cell: ({ row }) => `#${row.getValue('links')}`
  },
  {
    accessorKey: 'pages',
    header: ({ column }) => h('div', { class: 'text-right' }, getHeader(column, 'Pages')),
    cell: ({ row }) => {
      const pages = Number.parseFloat(row.getValue('pages'))

      const formatted = new Intl.NumberFormat('en-US', {
        style: 'decimal' // 'currency',
        // currency: 'EUR'
      }).format(pages)

      return h('div', { class: 'text-right font-medium' }, formatted)
    }
  },
  {
    id: 'action'
  }
]

const globalFilter = ref('') // Start with this filter

/* Sorting */
function getHeader(column: Column<RowCells>, label: string) {
  const isSorted = column.getIsSorted()

  return h(
    UDropdownMenu,
    {
      'content': {
        align: 'start'
      },
      'aria-label': 'Actions dropdown',
      'items': [
        {
          label: 'Asc',
          type: 'checkbox',
          icon: 'i-lucide-arrow-up-narrow-wide',
          checked: isSorted === 'asc',
          onSelect: () => {
            if (isSorted === 'asc') {
              column.clearSorting()
            } else {
              column.toggleSorting(false)
            }
          }
        },
        {
          label: 'Desc',
          icon: 'i-lucide-arrow-down-wide-narrow',
          type: 'checkbox',
          checked: isSorted === 'desc',
          onSelect: () => {
            if (isSorted === 'desc') {
              column.clearSorting()
            } else {
              column.toggleSorting(true)
            }
          }
        }
      ]
    },
    () =>
      h(UButton, {
        'color': 'neutral',
        'variant': 'ghost',
        label,
        'icon': isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        'class': '-mx-2.5 data-[state=open]:bg-elevated',
        'aria-label': `Sort by ${isSorted === 'asc' ? 'descending' : 'ascending'}`
      })
  )
}

const sorting = ref([
  {
    id: 'id',
    desc: true
  }
])
/* Visibility */
const table = useTemplateRef('table')

const columnVisibility = ref({
  date: false,
  pages: false,
  action: false
})

/* Start Action (Slots) */
function getDropdownActions(row: Row<RowCells>) {
  // Using this function instead of getRowCellsItems(row) {}
  return [
    [
      {
        type: 'label' as const,
        label: 'Actions'
      }
    ],
    [
      {
        label: row.getIsExpanded() ? 'Collapse' : 'Expand',
        title: JSON.stringify(row.original),
        icon: 'i-lucide-expand',
        onSelect() {
          row.toggleExpanded()
        }
      }
    ],
    [
      {
        label: 'Copy ID',
        title: row.original.id,
        icon: 'i-lucide-copy',
        onSelect: () => {
          copy(row.original.id.toString())

          toast.add({
            title: 'ID (original) copied to clipboard!',
            color: 'success',
            icon: 'i-lucide-circle-check'
          })
        }
      },
      {
        label: 'Copy Link(s)',
        title: row.original.links,
        icon: 'i-lucide-copy',
        onSelect: () => {
          copy(row.original.links)

          toast.add({
            title: 'Link(s) copied to clipboard!',
            color: 'success',
            icon: 'i-lucide-circle-check'
          })
        }
      },
      {
        label: 'Copy Status',
        title: row.original.status,
        icon: 'i-lucide-copy',
        onSelect: () => {
          copy(row.original.status.toString())

          toast.add({
            title: 'Status copied to clipboard!',
            color: 'success',
            icon: 'i-lucide-circle-check'
          })
        }
      }
    ],
    [
      // { type: 'separator' as const },
      {
        label: 'View row object',
        title: JSON.stringify(row.original)
      }
    ]
  ]
}
/* End of action (slots) */

/* Start RowCells context menu event */
const items = ref<ContextMenuItem[]>([])
/* function getRowCellsItems(row: TableRow<RowCells>) {
  return [
    // All the Objects in getDropdownActions - without arrays
  ]
} */
function onContextmenu(_e: Event, row: TableRow<RowCells>) {
  items.value = getDropdownActions(row) // getRowCellsItems(row)
}
/* End RowCells context menu event */

/* Start Hover */
const anchor = ref({ x: 0, y: 0 })

const reference = computed(() => ({
  getBoundingClientRect: () =>
    ({
      width: 0,
      height: 0,
      left: anchor.value.x,
      right: anchor.value.x,
      top: anchor.value.y,
      bottom: anchor.value.y,
      ...anchor.value
    }) as DOMRect
}))

const open = ref(false)
const openDebounced = refDebounced(open, 10)
const selectedRowCells = ref<TableRow<RowCells> | null>(null)

function onHover(_e: Event, row: TableRow<RowCells> | null) {
  selectedRowCells.value = row
  open.value = !!row
}
/* End Hover */
</script>

<template>
  <div v-if="page">
    <UPageHeader
      class="px-4 text-center"
      :title="page.title"
    />
    <div class="flex justify-between">
      <!--  -->
      <div class="px-4 py-3.5 border-b border-accented">
        <UInput
          v-model="globalFilter"
          icon="i-lucide-search"
          class="max-w-md"
          placeholder="Filter..."
        />
      </div>
      <div class="w-5/16 px-4 py-3.5 justify-end border-b border-accented">
        <!--  -->
        <UDropdownMenu
          :items="
            table?.tableApi
              ?.getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => ({
                label: upperFirst(column.id),
                type: 'checkbox' as const,
                checked: column.getIsVisible(),
                onUpdateChecked(checked: boolean) {
                  table?.tableApi?.getColumn(column.id)?.toggleVisibility(!!checked)
                },
                onSelect(e: Event) {
                  e.preventDefault()
                }
              }))
          "
          :content="{ align: 'end' }"
        >
          <UButton
            label="Columns"
            color="neutral"
            variant="outline"
            trailing-icon="i-lucide-chevron-down"
          />
        </UDropdownMenu>
      </div>
    </div>
    <div class="flex flex-col flex-1 w-full">
      <UContextMenu :items="items">
        <!-- Activate sticky header with className: max-h-[312px] -->
        <UTable
          ref="table"
          v-model:global-filter="globalFilter"
          v-model:sorting="sorting"
          v-model:column-visibility="columnVisibility"
          sticky
          :data="rows || []"
          :columns="columns"
          :loading="pending === true"
          class="flex-1 h-80"
          @pointermove="
            (ev: PointerEvent) => {
              anchor.x = ev.clientX
              anchor.y = ev.clientY
            }
          "
          @hover="onHover"
          @contextmenu="onContextmenu"
        >
          <template #action-cell="{ row }">
            <UDropdownMenu :items="getDropdownActions(row)">
              <UButton
                icon="i-lucide-ellipsis-vertical"
                color="neutral"
                variant="ghost"
                aria-label="Actions"
              />
            </UDropdownMenu>
          </template>
          <template #expanded="{ row }">
            <pre>{{ row.original }}</pre>
          </template>
        </UTable>
      </UContextMenu>
      <UPopover
        :content="{ side: 'top', sideOffset: 16, updatePositionStrategy: 'always' }"
        :open="openDebounced"
        :reference="reference"
      >
        <template #content>
          <div class="p-4">
            {{ selectedRowCells?.original?.id }}
          </div>
        </template>
      </UPopover>
    </div>
  </div>
</template>
