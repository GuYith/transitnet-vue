//Vue.config.js
module.exports = {
    devServer: {
        port: 8080,
        open: true,
        https: false,
        host: 'localhost',
        proxy: {
            '/api': {
                target: 'http://localhost:8090',
                changeOrigin: true,
                pathRewrite: {
                    '^/api': ''
                }
            }
        }
    }
}