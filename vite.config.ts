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
        outDir: 'lib',
        lib: {
            entry: 'src/index.ts',
            name: 'userBehavior',
            fileName: (format) => `user-behavior.${format}.js`
        }
    }
})