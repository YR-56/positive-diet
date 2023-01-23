<template>
  <div id="app">
    <Menu />
    <router-view/>
  </div>
</template>

<script>
import Menu from '@/components/Menu.vue';

export default {
  name: 'App',
  components: {
   // 読み込んだコンポーネント名をここに記述する
    Menu
  },
}
</script>