import { defineConfig, mergeConfig } from 'vite'
import base from '../vite.config'
// Local synthetic preview only; never use for a deployed build.
export default mergeConfig(base, defineConfig({ server: { host:'127.0.0.1', port:4320, strictPort:true, proxy: {
  '/api': { target:'http://127.0.0.1:4319', changeOrigin:true },
  '/__test': { target:'http://127.0.0.1:4319', changeOrigin:true },
} } }))
