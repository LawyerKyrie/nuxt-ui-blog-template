<template>
  <UDropdownMenu
    v-slot="{ open }"
    :modal="false"
    :items="[{
      label: 'Books',
      to: 'https://luther-books.vercel.app/',
      target: '_blank'
    }, {
      label: 'Works',
      to: 'https://Luthers-works-v1.vercel.app/',
      target: '_blank'
    }, {
      label: 'Dogma',
      to: 'https://christian-dogmatics.vercel.app/',
      target: '_blank'
    }, {
      label: 'Catechism',
      to: 'https://Luthers-catechism.vercel.app/',
      target: '_blank'
    }, {
      label: 'Blog Template',
      to: 'https://nuxt-ui-blog-template.nuxt.dev/',
      color: 'primary',
      checked: true,
      type: 'checkbox'
    }, {
      label: 'Chat',
      to: 'https://chat-template.nuxt.dev/',
      target: '_blank'
    }, {
      label: 'Portfolio',
      to: 'https://portfolio-template.nuxt.dev/',
      target: '_blank'
    }, {
      label: 'Changelog',
      to: 'https://changelog-template.nuxt.dev/',
      target: '_blank'
    }]"
    :content="{ align: 'start' }"
    :ui="{ content: 'min-w-fit' }"
    size="xs"
  >
    <UButton
      label="More"
      variant="subtle"
      trailing-icon="i-lucide-chevron-down"
      size="xs"
      class="-mb-[6px] font-semibold rounded-full truncate"
      :class="[open && 'bg-primary/15']"
      :ui="{
        trailingIcon: ['transition-transform duration-200', open ? 'rotate-180' : undefined].filter(Boolean).join(' ')
      }"
    />
  </UDropdownMenu>
</template>
