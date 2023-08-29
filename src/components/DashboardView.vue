<template>
  <section class="bg-white dark:bg-gray-900">
    <div class="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16 lg:px-6">
      <div class="flex">
        <button @click="onLogOut" type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center ml-auto mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Logout</button>
      </div>
      <div class="mx-auto mb-8 max-w-screen-sm lg:mb-16">
        <h2 class="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">Pages</h2>
        <h1 class="text-red-500 font-bold text-2xl">{{ErrMsg}}</h1>
      </div>
      <div class="grid gap-8 lg:gap-16 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <div v-for="(pageId, index) in pageInfor.pageIds" :key="pageId" class="text-center text-gray-500 dark:text-gray-400">
          <router-link :to="`/${pageInfor.pageIds[index]}/tags`" class="hover:bg-gray-400 cursor-pointer rounded-2xl">
            <img class="mx-auto mb-4 w-36 h-36 rounded-full" :src="pageInfor.imageSrcs[index]" alt="Bonnie Avatar">
            <h3 class="mb-1 text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
              <a>{{pageInfor.pageNames[index]}}</a>
            </h3>
            <p>{{pageInfor.pageIds[index]}}</p>
          </router-link>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import {onMounted, reactive, ref} from "vue"
import {StoreToken} from "../store.js"
import {useRouter} from "vue-router"
import axios from "axios";

const router = useRouter()
const store = StoreToken()
const isError = ref(false)
const ErrMsg = ref(null)

const pageInfor = reactive({
  pageNames: [],
  pageIds: [],
  imageSrcs: []
})

onMounted(async () => {

  try {
    const response = await axios.get(`https://pages.fm/api/v1/pages?access_token=${store.access_token}`)

    if (response.status === 200 && !response.data.error_code) {
      const totalPages = response.data.categorized.activated
      totalPages.forEach((page) => {
        pageInfor.pageNames.push(page.name)
        pageInfor.pageIds.push(page.id)
        pageInfor.imageSrcs.push(`https://pages.fm/api/v1/pages/${page.id}/avatar?access_token=${store.access_token}`)
      })
    } else {
      isError.value = true
      ErrMsg.value = response.data.message
      console.log(response.data)
    }
  } catch (e) {
    isError.value = true
    ErrMsg.value = e.data.message
  }
})

function onLogOut() {
  store.clearToken()
  router.push("/")
}
</script>

<style scoped>

</style>