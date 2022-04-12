//Vue.config.js
module.exports = {
    // publicPath: process.env.NODE_ENV === 'production' ? '/bus/' : '/',
    devServer: {
        port: 8085,
        open: true,
        https: false,
        host: 'localhost',
        proxy: {
            '/api': {
                target: 'http://localhost:8090',
                // target: 'http://47.105.33.143:8090',
                changeOrigin: true,
                pathRewrite: {
                    '^/api': ''
                }
            }
        }
    }
}