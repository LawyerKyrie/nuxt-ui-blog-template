<template>
  <div>
    <AppHeader />

    <UMain>
      <slot />
    </UMain>

    <!-- Added 19.11.2025 -->
    <BackToTop />

    <AppFooter />
  </div>
</template>
