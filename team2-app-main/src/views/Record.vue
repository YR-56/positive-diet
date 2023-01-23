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
        <i class="close icon" @click="clearMsg"></i>
        <span class="header">エラーが発生しました！</span>
        {{ errorMsg }}
      </p>

      <!-- ユーザー情報 -->
      <h1 style="color: olivedrab;">記録</h1>
      <!-- 投稿ボックス -->
      <div class="ui segment">
        <form class="ui form" @submit.prevent="postRecord">
          <div class="field">
            <input type="text" v-model="record.text" name="record-content" placeholder="運動の種類を入力" />
            <input type="number" class="mt-2" v-model="record.num" placeholder="回数を入力">

          </div>

          <div class="right-align">
            <button class="ui green button" v-bind:disabled="isPostButtonDisabled" type="submit">作成</button>
          </div>
        </form>
      </div>

      <!-- 記録一覧 -->
      <h3 class="ui dividing header">記録一覧</h3>
      <div class="ui segment">
       <ul class="ui comments divided article-list">
         <template v-for="(record, index) in records">
           <li class="comment" :key="index">
             <div class="content">
               <span class="author">種類：{{ record.training }}</span><br>
               <span class="author mt-1">回数：{{ record.number }}</span>
               <div class="metadata">
                 <!--<span class="date">{{ convertToLocaleString(record.timestamp) }}</span>-->
               </div>
               <button
                 v-if="false"
                 class="ui negative mini button right floated"
                 @click="deleteRecord(record)">
                 削除
               </button>
               <p class="text">
                 {{ record.text }}
               </p>
               <!-- span v-if="article.category" class="ui green label">{{ article.category }}</span> -->


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
// @は/srcの同じ意味です
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
      record: {
        text: null,
        num: null,
      },
      userId: localStorage.getItem('userId'),

      records: [],
      successMsg: '',
      errorMsg: '',
      iam: null,
      isCallingApi: false,
      modal_rep: false,
      //modal_view: false,

    };
  },

  computed: {
  // 計算した結果を変数として利用したいときはここに記述する
    isPostButtonDisabled() {
      return !this.record.text || !this.record.num;
    }
  },
  created: async function() {
    await this.getRecords();
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


    async getRecords() {
      this.isCallingApi = true;

      try{
        const res = await axios.get(baseUrl + `/record?userId=${this.userId}`,  { headers });

        this.records = res.data.records;
      }catch(e) {
        // this.errorMsg = `記録一覧取得時にエラーが発生しました: ${e}`;
      }finally{
        this.isCallingApi = false;
      }
    },
    async postRecord() {
      if(this.isCallingApi){
        return;
      }
      this.isCallingApi = true;

      const reqBody = {
        userId: this.userId,
        training: this.record.text,
        num: this.record.num
      }
      try {
        const res = await axios.post(baseUrl + '/record', reqBody,  { headers });
        this.records.unshift(res.data);
        this.successMsg = '記録が作成されました！';
        this.record.text = '';
        this.record.num = null;
      }catch(e){
        this.errorMsg = e;
        const errorMsg = e.response.data.message;
        if(errorMsg) {
          this.errorMsg = errorMsg;
        }
      }finally{
        this.isCallingApi = false;
        await this.getRecords();
      }
    },
    async deleteRecord(record) {
      // const recordId = record.recordId;
      console.log('削除', record);
    }
  },
}
</script>
<style scoped>
/* このコンポーネントだけに適用するCSSはここに記載する */
.mt-1 {
  margin-top: 5px !important;
}

.mt-2 {
  margin-top: 10px !important;
}
</style>