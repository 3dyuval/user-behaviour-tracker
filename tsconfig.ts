export default {
    "compilerOptions": {
        "target": "ESNext",
        "module": "ESNext",
        "lib": [
            "dom",
            "esnext"
        ],
        "moduleResolution": "node",
        "useDefineForClassFields": true,
        "allowSyntheticDefaultImports": true,
        "sourceMap": false,
        "removeComments": true,
        "resolveJsonModule": true,
        "strict": true,
        "noImplicitAny": true,
        "strictNullChecks": true,
        "strictFunctionTypes": true,
        "noImplicitThis": true,
        "alwaysStrict": true,
        "noUnusedParameters": true,
        "noImplicitReturns": true,
        "noFallthroughCasesInSwitch": true,
        "skipLibCheck": true,
        "noEmit": true,
        "incremental": true,
        "rootDir": ".",
        "paths": {
            "~/*": [
                "./src/*"
            ]
        }
    },
    "include": [
        "src",
        "tests"
    ]
}