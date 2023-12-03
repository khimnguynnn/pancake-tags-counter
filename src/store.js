import { defineStore } from 'pinia';

export const StoreToken = defineStore('StoreToken', {
    state: () => ({
        access_token: localStorage.getItem('access_token') || null
    }),
    actions: {
        setToken(token) {
            this.access_token = token
            localStorage.setItem('access_token', token);
        },
        clearToken() {
            this.access_token = null
            localStorage.removeItem('access_token');
        }
    },
    getters: {
        isAuthenticated(state) {
            return !!state.access_token
        }
    }
});
