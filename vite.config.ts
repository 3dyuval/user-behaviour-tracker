import { defineConfig, UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'

const common = {
    resolve: {
        alias: {
            '~': '/src'
        }
    },
    envPrefix: 'APP_',
    envDir: path.resolve('.') // root
} satisfies UserConfig


export default defineConfig(({ command }) => {

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