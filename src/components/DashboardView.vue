<template>
  <section class="bg-white dark:bg-gray-900">
    <div class="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16 lg:px-6">
      <div class="flex">
        <button @click="onLogOut" type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center ml-auto mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Logout</button>
      </div>
      <div class="mx-auto mb-8 max-w-screen-sm lg:mb-16">
        <h2 class="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">Pages</h2>
        <h1 class="text-red-500 font-bold text-2xl">{{ErrMsg}}</h1>
        <form>
          <label for="default-search" class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
              </svg>
            </div>
            <input v-model="searchString" type="search" id="default-search" class="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Tìm page" required>
          </div>
        </form>
      </div>
      <div class="grid gap-8 lg:gap-16 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <div v-for="item in pageInfoChange" :key="item.id" class="text-center text-gray-500 dark:text-gray-400">
          <router-link :to="`/${item.id}/tags`" class="hover:bg-gray-400 cursor-pointer rounded-2xl">
            <img class="mx-auto mb-4 w-36 h-36 rounded-full" :src="item.img" alt="Bonnie Avatar">
            <h3 class="mb-1 text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
              <a>{{item.name}}</a>
            </h3>
            <p>{{item.id}}</p>
          </router-link>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import {onMounted, ref, watch} from "vue"
import {StoreToken} from "../store.js"
import {useRouter} from "vue-router"
import axios from "axios";

const router = useRouter()
const store = StoreToken()
const isError = ref(false)
const ErrMsg = ref(null)
const searchString = ref(null)
const pageInfo = ref([])
const pageInfoChange = ref([])

onMounted(async () => {
  try {
    const response = await axios.get(`https://pages.fm/api/v1/pages?access_token=${store.access_token}`)

    if (response.status === 200 && !response.data.error_code) {
      const totalPages = response.data.categorized.activated
      totalPages.forEach((page) => {
        // pageInfo.pageNames.push(page.name)
        // pageInfo.pageIds.push(page.id)
        // pageInfo.imageSrcs.push(`https://pages.fm/api/v1/pages/${page.id}/avatar?access_token=${store.access_token}`)
        pageInfo.value.push({name: page.name, id: page.id, img: `https://pages.fm/api/v1/pages/${page.id}/avatar?access_token=${store.access_token}`})
      })
      console.log(pageInfo.value)
    } else {
      isError.value = true
      ErrMsg.value = response.data.message
      console.log(response.data)
    }
  } catch (e) {
    isError.value = true
    ErrMsg.value = e.data.message
  }
  finally {
    pageInfoChange.value = pageInfo.value
  }
})

watch(searchString, (newVal, oldVal) => {
  pageInfoChange.value = pageInfo.value.filter(item => {
    return item.name.toLowerCase().includes(newVal.toString().toLowerCase());
  })
})

function onLogOut() {
  store.clearToken()
  router.push("/")
}
</script>
