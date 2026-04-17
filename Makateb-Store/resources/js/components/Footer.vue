<template>
  <footer 
    class="relative mt-12"
    :style="{
      backgroundImage: `url(${woodTexture})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }"
  >
    <div class="absolute inset-0 bg-gradient-to-br from-amber-900/95 to-amber-950/95" />
    
    <!-- Orange line at the top -->
    <div class="relative h-px bg-orange-500 w-full"></div>
    
    <!-- Copyright section -->
    <div class="relative py-8 text-center">
      <p class="text-amber-200">{{ t('copyright') }}</p>
    </div>
  </footer>
</template>

<script setup>
import { useLanguageStore } from '../stores/language';

const languageStore = useLanguageStore();
const t = languageStore.t;
const woodTexture = '/bde3a495c5ad0d23397811532fdfa02fe66f448c.png';
</script>

