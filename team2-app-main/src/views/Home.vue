<template>
  <div>
    <div class="ui main container">
      <!-- 基本的なコンテンツはここに記載する -->
      <!-- loading表示用 -->
      <div class="ui active inverted page dimmer" v-if="isCallingApi">
        <div class="ui text loader">Loading</div>
      </div>

      <!-- エラーメッセージ用-->
      <p class="ui negative message" v-if="errorMsg">
        <i class="close icon" @click="clearMsg('error')"></i>
        <span class="header">エラーが発生しました！</span>
        {{ errorMsg }}
      </p>

      <!-- 成功メッセージ用-->
      <p class="ui positive message" v-if="successMsg">
        <i class="close icon" @click="clearMsg"></i>
        <span class="header">成功！</span>
        {{ successMsg }}
      </p>


      <!-- 投稿ボックス -->
      <div class="ui segment">
        <form class="ui form" @submit.prevent="postArticle">
          <div class="field">
            <textarea v-model="post.text" name="article-content" placeholder="今日はどんなこと頑張った？" />
          </div>

          <div class="right-align">
            <button class="ui green button" v-bind:disabled="isPostButtonDisabled" type="submit">投稿</button>
          </div>
        </form>
      </div>

      <!-- 検索ボックス -->
      <!-- <div class="ui segment">
       <form class="ui form" @submit.prevent="getSearchedArticles">
         <div class="field">
           <label for="userId">ユーザー名</label>
           <input v-model="search.userId" type="text" name="userId" placeholder="ユーザーID" />
         </div>

         <div class="field">
           <label for="category">カテゴリー名</label>
           <input v-model="search.category" type="text" name="category" placeholder="カテゴリ" />
         </div>

         <div class="field">
           <label>投稿日時</label>
           <div class="inline fields">
             <div class="field">
               <input v-model="search.start" type="datetime-local" name="timestampstart"/>
               <label for="timestampstart">から</label>
             </div>

             <div class="field">
               <input v-model="search.end" type="datetime-local" name="timestampend"/>
               <label for="timestampend">まで</label>
             </div>
           </div>
         </div>
         <div class="right-align">
           <button class="ui green button" type="submit" v-bind:disabled="isSearchButtonDisabled">検索</button>
         </div>
       </form>
      </div> -->

      <!-- 投稿一覧 -->
      <h3 class="ui dividing header">投稿一覧</h3>
      <div class="ui segment">
       <ul class="ui comments divided article-list">
         <template v-for="(article, index) in articles">
           <li class="comment" :key="index">
             <div class="content">
               <span class="author">{{ article.userId }}</span>
               <div class="metadata">
                 <span class="date">{{ convertToLocaleString(article.timestamp) }}</span>
               </div>
               <button
                 v-if="isMyArticle(article.userId)"
                 class="ui negative mini button right floated"
                 @click="deleteArticle(article)">
                 削除
               </button>
               <p class="text">
                 {{ article.text }}
               </p>
               <!-- span v-if="article.category" class="ui green label">{{ article.category }}</span> -->
              <div class="right-align reply-form">
                 <textarea v-model="reply.text[index]" name="article-content" placeholder="返信してみよう！" rows="3" cols="40" />
                 <button
                  class="ui primary button ml-2"
                  @click="postReply(article, index)"
                 >
                  返信
                 </button>
                 <!--
                 <button
                  class="ui primary button"
                  @click="showModal_rep(article.replys, article.userId, article.text)"

                 >

                  返信を見る
                 </button>
                 -->
              </div>
              <sui-accordion exclusive styled
                v-if="haveReplys(article.replys)"
              >
                <sui-accordion-title active>
                  <sui-icon name="dropdown" />
                  返信一覧
                </sui-accordion-title>
                <sui-accordion-content>
                  <ul class="ui comments divided">
                    <template v-for="(reply, index) in article.replys">
                      <li class="comment" :key="index">
                         <span class="author">{{ reply.userId }}</span>
                          <div class="metadata">
                            <span class="date">{{ convertToLocaleString(reply.timestamp) }}</span>
                          </div>
                          <p class="text">
                           {{ reply.text }}
                          </p>
                        <div class="ui divider"></div>
                      </li>
                    </template>
                  </ul>
                </sui-accordion-content>
              </sui-accordion>
              <div class="ui divider"></div>
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
//{{ article.userId }}
//class="ui active page dimmer" v-if="modal"
// @は/srcと同じ意味です
// import something from '@/components/something.vue';
import { baseUrl } from '@/assets/config.js';
import axios from "axios";


const headers = {'Authorization' : 'mtiToken'};

export default {
  name: 'Home',
  components: {
   // 読み込んだコンポーネント名をここに記述する
  },
  data() {
    // Vue.jsで使う変数はここに記述する
    return {
      post: {
        text: null,
      },
      reply: {
        index: null,
        text: Array(100)
      },
      //search: {
      //  userId: null,
      //},
      articles: [],
      iam: null,
      successMsg: '',
      errorMsg: '',
      isCallingApi: false,
      modal_rep: false,
      //modal_view: false,

    };
  },
  computed: {
  // 計算した結果を変数として利用したいときはここに記述する
    isPostButtonDisabled() {
      return !this.post.text;
    },
    isSearchButtonDisabled() {
      return !this.search.userId;
    },

    haveReplys() {
      return (replys)=>{
        return replys?.length != 0;
      }
    },

    isReply() {
      return (index)=>{
        return this.reply.index == index;
      }
    }
  },

  created: async function() {
    // Vue.jsの読み込みが完了したときに実行する処理はここに記述する
    // apiからarticleを取得する
    if(window.localStorage.getItem('userId') && window.localStorage.getItem('token')){
      this.iam = window.localStorage.getItem('userId');
      await this.getArticles();
    }else{
      window.localStorage.clear();
      this.$router.push({name: "Login"});
    }
  },

  methods: {

    // Vue.jsで使う関数はここで記述する
    clearMsg(target) {
      if(target==='error'){
        this.errorMsg='';
      }else{
        this.successMsg='';
      }
    },

    isMyArticle(id) {
      return this.iam === id;
    },

    async getArticles() {
      this.isCallingApi = true;

      try{
        const res = await axios.get(baseUrl + '/articles',  { headers });

        this.articles = res.data.articles;
      }catch(e) {
        this.errorMsg = `記事一覧取得時にエラーが発生しました: ${e}`;
      }finally{
        this.isCallingApi = false;
      }
    },
    //返信の投稿
    async postReply(article, index) {
      if(this.isCallingApi){
        return;
      }
      this.isCallingApi = true;

      const { actionId, replys } = article;

      const reqBody = {
        actionId,
        userId: this.iam,
        text: this.reply.text[index], // 返信欄に打ち込んだテキスト
        replys,
        timestamp: article.timestamp,
        article_text: article.text,
      }

      try {
        const res = await axios.post(baseUrl + '/reply/add', reqBody,  { headers });
        //this.article.replys.push({userId: this.iam, text: this.reply.text, timestamp: Date.now()}); //({...reqBody, timestamp: Date.now()});
        this.articles[index].replys = res.data.replys;
        this.successMsg = '返信が投稿されました！';
        this.reply.text[index] = '';
      }catch(e){
        console.error(e);
        this.errorMsg = e;
        const errorMsg = e.response.data.message;
        if(errorMsg) {
          this.errorMsg = errorMsg;
        }
      }finally{
        this.isCallingApi = false;
      }
    },
    //返信の削除  articleとreplyIndexによって削除する返信を特定
    async deleteReply(article, replyIndex) {
      if(this.isCallingApi){
        return;
      }
      this.isCallingApi = true;

      const { actionId, replys } = article;
      const repIdx = replyIndex;

      const reqBody = {
        actionId,
        replys,
        repIdx
      }

      try {
        //レコードを削除するわけではないのでpost
        const res = await axios.post(baseUrl + '/reply/delete', reqBody,  { headers });
        this.article.replys = res.data.replys;
        this.successMsg = '返信が削除されました！';
        this.reply.text = '';
      }catch(e){
        console.error(e);
        this.errorMsg = e;
      }finally{
        this.isCallingApi = false;
      }
    },

    async postArticle() {
      if(this.isCallingApi){
        return;
      }
      this.isCallingApi = true;

      const reqBody = {
        userId: this.iam,
        text: this.post.text,
      }
      try {
        const res = await axios.post(baseUrl + '/article', reqBody,  { headers });
        this.articles.unshift(res.data);
        this.successMsg = '記事が投稿されました！';
        this.post.text = '';
      }catch(e){
        this.errorMsg = e;
        const errorMsg = e.response.data.message;
        if(errorMsg) {
          this.errorMsg = errorMsg;
        }
      }finally{
        this.isCallingApi = false;
      }
    },

    async getSearchedArticles() {
      if(this.isCallingApi){
        return;
      }
      this.isCallingApi = true;

      // const { userId, category, start, end } = this.search;
      // const startTS = start? (new Date(start)).getTime() : '';
      // const endTS = end? (new Date(end)).getTime(): '';
      //const qs = `userId=${userId}&category=${category ?? ''}&start=${startTS}&end=${endTS}`;

      try {
        const res = await axios.get(baseUrl, { headers });
        this.articles = res.data.articles;
      }catch(e){
        console.error(e);
        this.errorMsg = e;
      }finally{
        this.isCallingApi = false;
      }
    },

    async deleteArticle(article) {
      if(this.isCallingApi){
        return;
      }
      this.isCallingApi = true;

      const actionId= article.actionId;
      const data = {
        actionId
      }
      try {
        await axios.delete(baseUrl + '/article', { data, headers });
        const deleted = this.articles.findIndex(a => a.actionId === actionId);
        this.articles.splice(deleted, 1);
        this.successMsg = '記事が削除されました！';
      }catch(e){
        console.error(e);
        this.errorMsg = e;
      }finally{
        this.isCallingApi = false;
      }
    },

    convertToLocaleString(timestamp) {
      return new Date(timestamp).toLocaleString();
    },
  }
}
</script>

<style scoped>
.article-list {
  list-style: none;
  margin: 0;
  padding: 0;
  max-width: 100%;
}
.right-align {
  text-align: right;
}
.reply-form {
  display: flex;
  align-items: end;
  justify-content: right;
}
.ml-2 {
  margin-left: 10px !important;
}
</style>
