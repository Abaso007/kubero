<template>
  <v-main>
    <router-view />
  </v-main>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useKuberoStore } from '../../stores/kubero'
import { useAuthStore } from '../../stores/auth'
import { mapWritableState } from 'pinia'


import { useCookies } from "vue3-cookies";
const { cookies } = useCookies();
const authStore = useAuthStore();

import axios from 'axios'
//axios.defaults.headers.common['User-Agent'] = 'Kubero/3.x'
//axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('kubero.JWT_TOKEN')
const token = cookies.get("kubero.JWT_TOKEN")
if (token) {
    authStore.loadToken(token);
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + token
}
//axios.defaults.headers.common['vary'] = 'Accept-Encoding'

export default defineComponent({
    name: 'DefaultView',
    created() {
        this.checkSession()
    },
    updated() {
        this.checkSession();
    },
    computed: {
        ...mapWritableState(useKuberoStore, [
            'kubero',
        ]),
    },
    data: () => ({
        session: false,
        isAuthenticated: false,
        templatesEnabled: true,
        version: "dev",
        kubernetesVersion: "unknown",
        operatorVersion: "unknown",
    }),
    methods: {
        checkSession() {
            if (this.$route.name != 'Login') {
                axios
                    .get("/api/auth/session")
                    .then((result) => {
                        console.log("isAuthenticated: " + result.data.isAuthenticated);

                        // safe version to vuetufy gloabl scope for use in components
                        this.kubero.templatesEnabled = result.data.templatesEnabled;
                        this.kubero.version = result.data.version;
                        this.kubero.operatorVersion = result.data.operatorVersion;
                        this.kubero.kubernetesVersion = result.data.kubernetesVersion;
                        this.kubero.isAuthenticated = result.data.isAuthenticated;
                        this.kubero.adminDisabled = result.data.adminDisabled;
                        this.kubero.buildPipeline = result.data.buildPipeline;
                        this.kubero.auditEnabled = result.data.auditEnabled;
                        this.kubero.consoleEnabled = result.data.consoleEnabled;
                        this.kubero.metricsEnabled = result.data.metricsEnabled;
                        this.kubero.sleepEnabled = result.data.sleepEnabled;
                    })
                    .catch((err) => {
                        if (err.response && err.response.status === 401) {
                            this.isAuthenticated = false;
                            authStore.reset();
                            this.$router.push('/login')
                        } else {
                            console.log(err);
                        }
                    });
            }
        },
    },
})
</script>

<style>

.severity-unknown {
    background-color: lightgrey !important;
    color: #0000008a !important;
}
.severity-low {
    background-color: #fdfda0 !important;
    color: #0000008a !important;
}
.severity-medium {
    background-color: #ffd07a !important;
    color: #0000008a !important;
}
.severity-high {
    background-color: #ff946d !important;
    color: #0000008a !important;
}
.severity-critical {
    background-color: #ff8080 !important;
    color: #0000008a !important;
}
.severity-total {
    background-color: gray !important;
    color: whitesmoke!important;
}

.theme--light.v-chip:not(.v-chip--active) {
    background: #e6e6e6;
}

.theme--dark.v-chip:not(.v-chip--active) {
    background: #2c2c2c;
}

</style>
