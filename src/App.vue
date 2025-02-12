<script setup>
import Cesium from '@/views/Cesium.vue'
import EcoLoading from '@/components/EcoLoading.vue'
import { isLoading } from '@/store'
</script>

<template>
  <Cesium />
  <EcoLoading v-if="isLoading" />
</template>
