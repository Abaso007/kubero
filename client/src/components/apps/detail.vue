<template>
    <v-container>
        <breadcrumbs :items="breadcrumbItems"></breadcrumbs>

        <v-container class="d-flex justify-space-between align-center mb-2">
            <v-tabs v-model="tab"  class="background">
                <v-tab class="background">Logs</v-tab>
                <v-tab class="background">Events</v-tab>
                <v-tab class="background">Vulnerabilities</v-tab>
                <v-spacer  class="background"></v-spacer>
            </v-tabs>


            <v-menu offset-y>
            <template v-slot:activator="{ on, attrs }">
                <v-btn
                color="primary"
                dark
                v-bind="attrs"
                v-on="on"
                >
                        <v-icon color="white">mdi-menu-open</v-icon>
                Actions
                </v-btn>
            </template>
            <v-list>
                <v-list-item-group>
                    <v-list-item
                        @click="ActionEditApp">
                        <v-list-item-icon>
                            <v-icon small>mdi-pencil</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                            <v-list-item-title>Edit App</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item
                        @click="ActionOpenApp">
                        <v-list-item-icon>
                            <v-icon small>mdi-open-in-new</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>Open App</v-list-item-title>
                    </v-list-item>
                    <v-list-item 
                        disabled
                        @click="ActionStartDownload">
                        <v-list-item-icon>
                            <v-icon small>mdi-download</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>Download Config</v-list-item-title>
                    </v-list-item>
                </v-list-item-group>
            </v-list>
            </v-menu>
        </v-container>
        
        <v-tabs-items v-model="tab">
            <v-tab-item transition="false" class="background">
                <logs :pipeline="pipeline" :phase="phase" :app="app" :deploymentstrategy="appData.spec.deploymentstrategy"/>
            </v-tab-item>
            <v-tab-item transition="false" class="background">
                <events :pipeline="pipeline" :phase="phase" :app="app"/>
            </v-tab-item>
            <v-tab-item transition="false" class="background">
                <vulnerabilities :pipeline="pipeline" :phase="phase" :app="app"/>
            </v-tab-item>
        </v-tabs-items>
    </v-container>
</template>

<script>
import axios from "axios";
export default {
    data () {
        return {
            tab: null,
            breadcrumbItems: [
                {
                    text: 'DASHBOARD',
                    disabled: false,
                    href: '#/',
                },
                {
                    text: 'PIPELINE:'+this.pipeline,
                    disabled: false,
                    href: '#/pipeline/'+this.pipeline+'/apps',
                },
                {
                    text: 'PHASE:'+this.phase,
                    disabled: true,
                    href: `#/pipeline/${this.pipeline}/${this.phase}/${this.app}/detail`,
                },
                {
                    text: 'APP:'+this.app,
                    disabled: true,
                    href: `#/pipeline/${this.pipeline}/${this.phase}/${this.app}/detail`,
                }
            ],
            pipelineData: {},
            appData: {},
        }
    },
    mounted() {
        this.loadPipeline();
        this.loadApp();
        this.socketJoin();
    },
    beforeDestroy() {
        this.socketLeave();
    },
    methods: {
        socketLeave() {
            this.$socket.client.emit("leave", {
                room: `${this.pipeline}-${this.phase}-${this.app}`,
            });
        },
        socketJoin() {
            this.$socket.client.emit("join", {
                room: `${this.pipeline}-${this.phase}-${this.app}`,
            });
        },
        loadPipeline() {
            axios.get('/api/pipelines/'+this.pipeline).then(response => {
                this.pipelineData = response.data;
            });
        },
        loadApp() {
            axios.get('/api/pipelines/'+this.pipeline+'/'+this.phase+'/'+this.app).then(response => {
                this.appData = response.data;
            });
        },
        ActionOpenApp() {
            window.open(`https://app.${this.appData.spec.domain}`, '_blank');
        },
        ActionEditApp() {
            this.$router.push(`/pipeline/${this.pipeline}/${this.phase}/${this.app}`);
        },
        ActionStartDownload() {
            console.log("ActionStartDownload");
        }
    },

    components: {
        events : () => import('./events.vue'),
        logs : () => import('./logstab.vue'),
        vulnerabilities : () => import('./vulnerabilities.vue'),
        breadcrumbs: () => import('../breadcrumbs.vue'),
    },
    props: {
      pipeline: {
        type: String,
        default: "MISSING"
      },
      phase: {
        type: String,
        default: "MISSING"
      },
      app: {
        type: String,
        default: "new"
      }
    },
}
</script>

<style scoped>
.v-list-item__icon:first-child {
    margin-right: 0px;
    margin: 10px
}
.v-list-item {
    min-height: 32px;
}
</style>