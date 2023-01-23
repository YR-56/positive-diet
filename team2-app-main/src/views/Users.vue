<template>
  <div>
    <div class="ui main container">
      <!-- 基本的なコンテンツはここに記載する -->
  
      <!-- 発展課題のローディング表示用 -->
      <div class="ui active inverted page dimmer" v-if="isCallingApi">
        <div class="ui text loader">Loading</div>
      </div>
      
      <!-- 発展課題のエラーメッセージ用 -->
      <p class="ui negative message" v-if="errorMsg">
        <i class="close icon" @click="clearError"></i>
        <span class="header">エラーが発生しました！</span>
        {{ errorMsg }}
      </p>
  
       検索ボックス 
      <div class="ui segment">
        <form class="ui form">
          <div class="field">
            <label for="name">ユーザー名</label>
            <input v-model="name" type="text" name="name" placeholder="Name" />
          </div>
        </form>
      </div>
      
      <!-- ユーザー一覧 -->
      <ul class="ui three column grid">
        <template v-for="(item, index) in filteredUsers">
          <li class="column" :key="index">
            <div class="ui card fluid" >
              <div class="content">
                <h2 class="header">
                  name:{{ item.name }}
                  email:{{ item.email }}
                  lineId:{{ item.lineId }}
                  <span class="ui green label">{{ item.userId }}</span>
                </h2>
              </div>
            </div>
          </li>
        </template>
      </ul>
    </div>
  </div>
</template>

<script>
// 必要なものはここでインポートする
// @は/srcの同じ意味です
// import something from '@/components/something.vue';
import { baseUrl } from '@/assets/config.js';
import axios from "axios";

const headers = {'Authorization' : 'mtiToken'};

export default {
  name: 'team2-User',
  components: {
   // 読み込んだコンポーネント名をここに記述する
  },
  data() {
  // Vue.jsで使う変数はここに記述する
    return {
      users: [],
      name: "",
      // start: 0,
      // end: 100,
      errorMsg: "", // 発展課題のエラーメッセージ用
      isCallingApi: false // 発展課題のローディング表示用
    };
  },
  computed: {
  // 計算した結果を変数として利用したいときはここに記述する
    filteredUsers() {
      return this.users.filter(e => 
        e.name?.match(this.name) 
        // && e.age >= this.start
        // && e.age <= this.end
      );
    }
  },
  methods: {
    // Vue.jsで使う関数はここで記述する   
    // 発展課題のエラーメッセージ用
    clearError() {
      this.errorMsg=''
    },
  },
  

  created: async function() {
    this.isCallingApi = true;
  
    try{
      const res = await axios.get(baseUrl + "/users", { headers });
      this.users = res.data.users;
    }catch(e){
      this.errorMsg = `ユーザーリスト取得時にエラーが発生しました: ${e}`;
    }finally{
      this.isCallingApi = false;
    }
  }
}
</script>
<style scoped>
/* このコンポーネントだけに適用するCSSは */
</style>