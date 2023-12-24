import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ command }) => {

    const common = {
        resolve: {
            alias: {
                '~': '/src'
            }
        },
        test: {
            environment: 'jsdom'
        }
    }

    if (command === 'serve') {
        return {
            ...common,
            root: './example',
            plugins: [vue()],
        }
    }

    if (command === 'build') {
        return {
            ...common,
            build: {
                outDir: 'lib',
                lib: {
                    entry: 'src/index.ts',
                    name: 'userBehavior',
                    fileName: (format) => `user-behavior.${format}.js`
                }
            }
        }
    }
})