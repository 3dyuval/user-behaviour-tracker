/// <reference types="vitest" />
import { defineConfig } from 'vite'


export default defineConfig({
    test: {
        environment: 'jsdom'
    },
    resolve: {
        alias: {
            '~': '/src'
        }
    },
    build: {
        lib: {
            entry: 'src/index.ts',
            name: 'userBehavior',
            fileName: (format) => `user-behavior.${format}.js`
        }
    }
})