<script setup lang="ts">
import Tracker from '../../src/index'
import { computed, reactive, ref, watch } from 'vue'
import Render from './Render.vue'


const tracker = new Tracker({
  mouseEventsInterval: 500,
  callbackInterval: 1000,
  callback: console.info,
  debug: true
});

const openAiKey = import.meta.env.APP_OPENAI_API_KEY

const rawData = ref({})
const isTracking = ref(false)
const isAnalyzing = ref(false)

const actions = reactive({

  start: {
    name: 'start',
    description: 'Starts the tracker',
    props: computed(() => ({
      disabled: isTracking.value
    })),
    handler: () => {
      rawData.value = 'tracking...';
      tracker.start()
      isTracking.value = true
    }
  },

  stop: {
    name: 'stop',
    description: 'Stops the tracker',
    props: computed(() => ({
      disabled: !isTracking.value
    })),
    handler: () => {
      rawData.value = tracker.stop()
      isTracking.value = false
    }
  },

  analyze: {
    name: computed(() =>
      isAnalyzing.value ? 'Analyzing...' : 'Analyze'
    ),
    description: 'Analyze user input data into insight',
    props: computed(() => ({
      disabled: !!isAnalyzing.value || !Object.keys(rawData.value).length
    })),
    handler: async () => {
      isAnalyzing.value = true
      rawData.value =  tracker.analyzeResults()
      rawData.value = await tracker.getInsights({
        openAiKey,
      })
      isAnalyzing.value = false

    }
  },
})

</script>

<template>
  <h1>User Behavior Tracker</h1>
  <p v-if="rawData.insights">{{ rawData.insights }}</p>
  <button
      v-for="{name, description, handler, props: { disabled }} of actions"
      :alt="description"
      :disabled="disabled"
      @click="handler"
  >{{ name }}
  </button>
  <hr/>
  <h2>Results</h2>
  <render
      v-if="rawData?.clicks"
      :clicks="rawData?.clicks"
      :width="rawData?.userInfo?.screenWidth"
      :height="rawData?.userInfo?.screenHeight"
  />
  <pre class="raw-data-block">
    {{ rawData }}
  </pre>
</template>

<style scoped>

.raw-data-block {
  background-color: #eee;
  padding: 1rem;
  border-radius: 1rem;
  max-width: 100%;
  overflow: auto;
  max-height: 50vh;
}

button, pre, code, h1, h2, h3, h4, h5, h6 {
  padding: .8rem;
  border-radius: .25rem;
  border: none;
  margin-inline-end: .25rem;
  margin-inline-start: .25rem;
}
</style>