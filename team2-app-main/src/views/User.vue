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
      <!-- ユーザー情報 -->
      <h1 style="color: olivedrab;">{{ user.name }}</h1>
      
      <ul class="ui three column grid">
        <li class="row">
          <div class="ui card">
            <div class="content">
              <h2 class="header">
                <p>Info</p>
              </h2>
              <div class="ui list">
                <div class="item">
                  <i class="users icon"></i>
                  <div class="content">
                    {{ user.userId }}
                  </div>
                </div>
                <div class="item">
                  <i class="marker icon"></i>
                  <div class="content">
                    福岡県
                  </div>
                </div>
                <div class="item">
                  <i class="filter icon"></i>
                  <div class="content">
                    55
                  </div>
                </div>
                <div class="item">
                  <i class="address book icon"></i>
                  <div class="content">
                    <a href="mailto:jack@semantic-ui.com">{{ user.lineId }}</a>
                  </div>
                </div>
                <div class="item">
                  <i class="linkify icon"></i>
                  <div class="content">
                    <a href="http://www.semantic-ui.com">Twitter</a>
                  </div>
                </div>
                <div class="item">
                  <i class="chart line icon"></i>
                  <div class="content">
                    {{ user.target }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </li>
      </ul>
      <h1 style="color: olivedrab;">記録</h1>
      <div class="ui segment">
        <img class="ui centered medium image" src="@/assets/img/graph_fukugou.png">
      </div>

      <h1 style="color: olivedrab;">投稿一覧</h1>
      
        <!-- 投稿一覧 -->
      
      <div class="ui segment">
        <ul class="ui comments divided article-list">
          <template v-for="(article, index) in articles">
            <li class="comment" :key="index">
              <div class="content">
                <span class="author">{{ article.userId }}</span>
                <div class="metadata">
                  <span class="date"></span>
                </div>
                <button v-if="isMyArticle(article.userId)" class="ui negative mini button right floated"
                  @click="deleteArticle(article)">
                  削除
                </button>
                <p class="text">
                  {{ article.text }}
                </p>
                
              </div>
            </li>
          </template>
        </ul>
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

const headers = {'Authorization' : 'mtiToken'};

export default {
  name: 'team2-User',
  components: {
   // 読み込んだコンポーネント名をここに記述する
  },
  data() {
  // Vue.jsで使う変数はここに記述する
    return {
      user: {
        userId: window.localStorage.userId,
        name: "",
        email: "",
        lineId: "",
        target: "",
      },
      post: {
        text: null,
        category: null,
      },
      search: {
        userId: null,
        category: null,
        start: null,
        end: null,
      },
      articles: [],
      iam: null,
      successMsg: '',
      errorMsg: "", // 発展課題のエラーメッセージ用
      isCallingApi: false // 発展課題のローディング表示用
    };
  },
  computed: {
  },
  methods: {
    // Vue.jsで使う関数はここで記述する   
    // 発展課題のエラーメッセージ用
    clearError() {
      this.errorMsg=''
    },
    isMyArticle(id) {
      return this.iam === id;
    },
    async getArticles() {
      this.isCallingApi = true;

      try{
        const res2 = await axios.get(baseUrl + '/articles',  { headers });

        this.articles = res2.data.articles;
      }catch(e) {
        this.errorMsg = `記事一覧取得時にエラーが発生しました: ${e}`;
      }finally{
        this.isCallingApi = false;
      }
    },

    async getSearchedArticles() {
      if (this.isCallingApi) {
        return;
      }
      this.isCallingApi = true;

      const { userId } = this.search;
      const qs = `userId=${userId}`;

      try {
        const res = await axios.get(baseUrl + `/articles?${qs}`, { headers });
        this.articles = res.data.articles;
      } catch (e) {
        console.error(e);
        this.errorMsg = e;
      } finally {
        this.isCallingApi = false;
      }
    },
    
  },
  
  created: async function() {
    
    this.isCallingApi = true;
    
  
    try{
      const res = await axios.get(baseUrl + `/user?userId=${this.user.userId}`,  { headers });
      const res2 = await axios.get(baseUrl + '/articles',  { headers });
      console.log("1")
      console.log(res2.data);
      this.user.name = res.data.name;
      this.user.email = res.data.email;
      this.user.lineId = res.data.lineId;
      this.user.target = res.data.target;
      this.articles = res2.data.articles;
      this.articles = this.articles.filter(article => {
        return article.userId == this.user.userId;
      });
      console.log("2")
      console.log(this.articles);
    }catch(e) {
      this.errorMsg = `ユーザー情報取得時にエラーが発生しました: ${e}`;
    }finally{
      this.isCallingApi = false;
    }
    
    // if(window.localStorage.getItem('userId') && window.localStorage.getItem('token')){
    //   this.iam = window.localStorage.getItem('userId');
    //   await this.getArticles();
    // }else{
    //   window.localStorage.clear();
    //   this.$router.push({name: "Login"});
    // }
  }

}
</script>
<style scoped>
/* このコンポーネントだけに適用するCSSは */
</style>
