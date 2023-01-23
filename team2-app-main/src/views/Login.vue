<template>
  <div>
    <div class="ui main container">
      <!-- 基本的なコンテンツはここに記載する -->

      <!-- 発展課題のローディング表示用 -->
      <div class="ui active inverted page dimmer" v-if="isCallingApi">
        <div class="ui text loader">Loading</div>
      </div>

      <div class="ui segment">
        <!-- 発展課題のエラーメッセージ用-->
        <p class="ui negative message" v-if="errorMsg">
          <i class="close icon" @click="clearError"></i>
          <span class="header">エラーが発生しました！</span>
          {{ errorMsg }}
        </p>

        <!-- submitイベントを拾って、preventにて規定のアクションを中止し、submitメソッドを呼び出す。-->
        <form class="ui large form" @submit.prevent="submit" >
          <div class="field" v-if="isLogin">
            <div class="ui left icon input">
              <i class="user icon"></i>
              <input v-model="user.userId" type="text" placeholder="ID"/>
            </div>
          </div>


          <div class="field">
            <div class="ui left icon input">
              <i class="lock icon"></i>
              <input v-model="user.password" type="password" placeholder="Password"/>
            </div>
          </div>

          <div class="field" v-if="!isLogin">
            <div class="ui left icon input">
              <i class="tag icon"></i>
              <input v-model="user.name" type="text" placeholder="Name"/>
            </div>
          </div>

          <div class="field" v-if="!isLogin">
            <div class="ui left icon input">
              <i class="tag icon"></i>
              <input v-model="user.email" type="text" placeholder="Email"/>
            </div>
          </div>

          <div class="field" v-if="!isLogin">
            <div class="ui left icon input">
              <i class="tag icon"></i>
              <input v-model="user.target" type="text" placeholder="Target"/>
            </div>
          </div>

          <button class="ui huge green fluid button" v-bind:disabled="isButtonDisabled" type="submit">{{ submitBtnText }}</button>
        </form>
      </div>

      <button @click="toggleMode" class="ui huge grey fluid button" type="submit">{{ toggledBtnText }}</button>
      <div class="line-btn-wrapper">
        <button class="line-btn" @click="clickLineLogin"><img src="@/assets/LINE/btn_login_base.png" alt=""></button>
      </div>
    </div>
  </div>
</template>
<script>

// 必要なものはここでインポートする
// @は/srcの同じ意味です
// import something from '@/components/something.vue';
import { baseUrl } from '@/assets/config.js';
import axios from "axios";

export default {
  name: 'Login',

  components: {
    // 読み込んだコンポーネント名をここに記述する
  },

  data() {
    // Vue.jsで使う変数はここに記述する
    return {
      isLogin: true,
      user: {
        userId: null,
        password: null,
        name: null,
        email: null,
        target: null,
      },
      errorMsg: "", // 発展課題のエラーメッセージ用
      isCallingApi: false // 発展課題のローディング表示用
    };
  },


  computed: {
    // 計算した結果を変数として利用したいときはここに記述する

    // 発展課題のボタン活性/非活性用
    isButtonDisabled() {
      const { userId, password, name, email, target} = this.user;
      return this.isLogin
        ? !userId || !password
        : !password || !name || !email || !target;
    },

    submitBtnText() {
      return this.isLogin ? 'ログイン':'新規登録'
    },

    toggledBtnText() {
      return this.isLogin ? '新規登録':'ログイン'
    }
  },

  methods: {
    // Vue.jsで使う関数はここで記述する

    // 発展課題のエラーメッセージ用
    clearError() {
      this.errorMsg=''
    },

    toggleMode() {
      this.user = {};
      this.isLogin = !this.isLogin;
    },

    async submit() {
      if(this.isCallingApi){
        return;
      }
      this.isCallingApi = true;

      const path = this.isLogin? '/user/login' : '/user/signup';
      let { userId, password, name, email, target } = this.user;
      // 新規登録の場合userIdを自動生成する
      if(!this.isLogin) {
        userId = new Date().getTime().toString(16);
      }


      const reqBody = this.isLogin
        ?{ userId, password }
        :{ userId, password, name, email, target };

      try {
        const res = await axios.post(baseUrl + path, reqBody);
        window.localStorage.setItem('token', res.data.token);
        window.localStorage.setItem('userId', userId);
        this.$router.push({name: "Home"});
      }catch(e){
        this.errorMsg = e;
      }finally{
        this.isCallingApi = false;
      }
    },
    clickLineLogin() {
      window.location.href = baseUrl + '/oauth';
    }
  },
}
</script>
<style scoped>
.line-btn-wrapper {
  display: flex;
  justify-content: center;
}
.line-btn {
  border: none;
  background: none;
  margin: 50px auto 0;
}
/* このコンポーネントだけに適用するCSSはここに記述する */
</style>
