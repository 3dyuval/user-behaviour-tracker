<script setup lang="ts">
import Tracker from '../../src/index'
import { computed, reactive, ref } from 'vue'
import Render from './Render.vue'


const tracker = new Tracker({
  mouseMovementInterval: 500,
  callbackInterval: 5000
});

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
      tracker.clear()
      isTracking.value = false
      console.dir(rawData.value, { colors: true, depth: 10, showProxy: false });
    }
  },
  analyze: {
    name: computed(() =>
      isAnalyzing.value ? 'Analyzing...' : 'Analyze'
    ),
    description: 'Analyze user input data into insight',
    props: computed(() => ({
      disabled: !!isAnalyzing.value || !rawData.value?.clicks
    })),
    handler: async () => {
      isAnalyzing.value = true
      rawData.value = await tracker.analyzeResults({
        openAiKey: import.meta.env['VITE_OPENAI_KEY'],
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
</style>