<template>
  <section class="bg-white dark:bg-gray-900">
    <div class="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
      <div>
        <button @click="backDashboard" type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center ml-auto mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Dashboard</button>
      </div>
      <div class="mx-auto mb-8 max-w-screen-sm lg:mb-16 bg">
        <h2 class="text-4xl tracking-tight font-bold text-gray-900 dark:text-white text-center">Số người theo Tag: {{peopleCounts}}</h2>
        <div class="flex justify-center items-center">
          <button @click="onResetChoice" type="button" class="mt-5 text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Reset choice</button>
        </div>
      </div>
    </div>
  </section>
  <section class="bg-white dark:bg-gray-900 -mt-20">
    <div class="py-8 px-4 mx-auto max-w-screen-xl text-center">
      <div class="grid gap-8 lg:gap-16 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-8">
        <div v-for="(tag,index) in Tags" :key="tag" class="text-center text-gray-500 dark:text-gray-400">
          <div class="flex items-center">
            <input v-model="selected" :id="tag" type="checkbox" :value="index" class="cursor-pointer w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
            <label :for="tag" class="ml-2 text-sm font-medium cursor-pointer text-gray-900 dark:text-gray-300 py-3">{{tag}}</label>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import {onMounted,ref,watch} from "vue";
import {useRouter} from "vue-router";
import axios from "axios";
import {StoreToken} from "../store.js";

const router = useRouter()
const Tags = ref([])
const pageId = ref(null)
const selected = ref([])
const store = StoreToken()
const peopleCounts = ref(0)


watch(selected,async (newVal,oldVal) => {
  peopleCounts.value = 0
  if (newVal.length === 0) {
    return 1
  }

  selected.value.sort(function (a,b) {
    return a - b;
  })

  const listedString = selected.value.join(",")

  try {
    let currentCount = 0;
    let shouldContinue = true;
    while (shouldContinue) {
      const response = await axios.get(`https://pages.fm/api/v1/pages/${pageId.value}/conversations?unread_first=true&type=false&tags=[${listedString}]&except_tags=[]&current_count=${currentCount}&access_token=${store.access_token}&mode=AND`);

      peopleCounts.value += response.data.conversations.length;
      currentCount += response.data.conversations.length;

      if (response.data.conversations.length < 40) {
        shouldContinue = false;
      }
    }
  } catch (err) {}
})

onMounted(async () => {
  pageId.value = router.currentRoute.value.params.id
  try {
    const response = await axios.get(`https://pages.fm/api/v1/pages/${pageId.value}/settings?access_token=${store.access_token}`)

    const data = response.data.settings.tags
    data.forEach((value) => {
      Tags.value.push(value.text)

    })

  } catch (e) {
  }
})

function backDashboard() {
  router.push("/dashboard")
}
function onResetChoice() {
  selected.value = []
  peopleCounts.value = 0
}
</script>