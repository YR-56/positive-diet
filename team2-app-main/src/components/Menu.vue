<template>

  <div class="ui secondary pointing olive inverted massive menu" v-if="isMenuNeeded">
    <!-- 基本的なコンテンツはここに記載する -->
    <router-link active-class="active" class="item" exact to="/">ホーム</router-link>
    <router-link active-class="active" class="item" to="/User">ユーザー</router-link>
    <router-link active-class="active" class="item" to="/Record">記録</router-link>
    <!-- <router-link active-class="active" class="item" to="/Users">Users</router-link> -->
    <!-- <router-link active-class="active" class="item" to="/Profile">Profile</router-link> -->
    <div class="right menu">
      <a @click="logout" class="item">ログアウト</a>

    </div>
  </div>
</template>
<script>
// 必要なものはここでインポートする
// @は/srcの同じ意味です
// import something from '@/components/something.vue';

export default {
  name: 'Menu',
  components: {
   // 読み込んだコンポーネント名をここに記述する
  },
  data() {
  // Vue.jsで使う変数はここに記述する
    return {
    };
  },
  computed: {
  // 計算した結果を変数として利用したいときはここに記述する
    isMenuNeeded() {
      return this.$route.name !== 'Login';
    }
  },
  methods: {
  // Vue.jsで使う関数はここで記述する
    logout() {
      window.localStorage.clear();
      this.$router.push({name: "Login"});
    }
  },
}
</script>
<style scoped>
/* このコンポーネントだけに適用するCSSはここに記述する */
</style>
