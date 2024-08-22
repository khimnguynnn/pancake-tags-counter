<template>
  <section class="bg-gray-50 dark:bg-gray-900">
    <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      <div class="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
        <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
          <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
            Sign in to your account
          </h1>
          <form class="space-y-4 md:space-y-6" @submit.prevent="onSubmitToken">
            <div>
              <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Access Token</label>
              <input v-model="access_token" type="password" name="password" id="password" placeholder="••••••••" class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required="">
            </div>
            <button type="submit" class="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Đăng Nhập</button>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import {ref,onMounted} from "vue"
import {StoreToken} from "../store.js"
import {useRouter} from "vue-router"

const access_token = ref(null)
const store = StoreToken()
const router = useRouter()

onMounted(() => {
  if (store.isAuthenticated){
    router.push("/dashboard")
  }
})
function onSubmitToken() {
  store.setToken(access_token.value)

  router.push("/dashboard")
}
</script>