<template>
  <div>
    <div class="ui main container">
  
      <!-- 発展課題のローディング表示用 -->
      <div class="ui active inverted page dimmer" v-if="isCallingApi">
        <div class="ui text loader">Loading</div>
      </div>
  
      <div class="ui segment">
        <!-- 発展課題のエラーメッセージ用-->
        <p class="ui negative message" v-if="errorMsg">
          <i class="close icon" @click="clearMsg('error')"></i>
          <span class="header">エラーが発生しました！</span>
          {{ errorMsg }}
        </p>
        
        <!-- 発展課題の成功メッセージ用-->
        <p class="ui positive message" v-if="successMsg">
          <i class="close icon" @click="clearMsg"></i>
          <span class="header">完了しました！</span>
          {{ successMsg }}
        </p>
  
        <!-- 更新情報入力用フォーム -->
        <form class="ui large form" @submit.prevent="submit" >
          <div class="field">
            <div class="ui left icon input">
              <i class="user icon"></i>
              <input v-model="user.userId" type="text" placeholder="ID" required disabled/>
            </div>
          </div>

          <div class="field">
            <div class="ui left icon input">
              <i class="lock icon"></i>
              <input v-model="user.password" type="text" placeholder="Password"/>
            </div>
          </div>
          
          <div class="field">
            <div class="ui left icon input">
              <i class="tag icon"></i>
              <input v-model="user.nickname" type="text" placeholder="Nickname"/>
            </div>
          </div>
          
          <div class="field">
            <div class="ui left icon input">
              <i class="calendar icon"></i>
              <input v-model.number="user.age" type="number" min="0"  placeholder="Age"/>
            </div>
          </div>
          
          <button class="ui huge green fluid button" v-bind:disabled="isButtonDisabled" type="submit">更新</button>
        </form>
      </div>
      <button @click="deleteUser" class="ui huge grey fluid button" type="submit">退会</button>
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
  name: 'Profile',
  components: {
    // 読み込んだコンポーネント名をここに記述する
  },
  data() {
    // Vue.jsで使う変数はここに記述する
    return {
      user: {
        userId: window.localStorage.userId,
        password: null,
        nickname: null,
        age: null
      },
      errorMsg: '', // 発展課題のエラーメッセージ用
      successMsg: '', //発展課題の成功メッセージ用
      isCallingApi: false // 発展課題のローディング表示用
    };
  },
  computed: {
    // 計算した結果を変数として利用したいときはここに記述する
    isButtonDisabled() {
      const { userId, password, nickname, age } = this.user;
      return !userId || !password || !nickname || !age;
    },
  },

  methods: {
    // Vue.jsで使う関数はここで記述する
    // 発展課題のエラー・成功メッセージ用
    clearMsg(target) {
      if(target==='error'){
        this.errorMsg='';
      }else{
        this.successMsg='';
      }
    },
    
    async submit() {
      if(this.isCallingApi){
        return;
      }
      this.isCallingApi = true;
  
      const { userId, password, nickname, age } = this.user;
      const reqBody = {
        userId,
        password,
        nickname,
        age
      };
      
      try {
        await axios.put(baseUrl + '/user', reqBody,  { headers });
        this.successMsg = 'ユーザー更新処理が完了しました'
      }catch(e){
        this.errorMsg = `ユーザー更新時にエラーが発生しました: ${e}`;
      }finally{
        this.isCallingApi = false;
      }
    },
    
    async deleteUser() {
      if(this.isCallingApi){
        return;
      }
      this.isCallingApi = true;
  
      const data = {
        userId: this.user.userId,
      }
      
      try{
        await axios.delete(baseUrl + '/user', { data, headers })
        this.$router.push({name: "Login"});
      }catch(e){
        this.errorMsg = `ユーザー削除時にエラーが発生しました: ${e}`;
      }finally{
        this.isCallingApi = false;
      }
    }
  },
  
  created: async function() { 
    this.isCallingApi = true;
  
    try{
      const res = await axios.get(baseUrl + `/user?userId=${this.user.userId}`,  { headers });

      this.user.nickname = res.data.nickname;
      this.user.age = res.data.age;
    }catch(e) {
      this.errorMsg = `ユーザー情報取得時にエラーが発生しました: ${e}`;
    }finally{
      this.isCallingApi = false;
    }
  }
}
</script>
<style scoped>
/* このコンポーネントだけに適用するCSSは */
</style>