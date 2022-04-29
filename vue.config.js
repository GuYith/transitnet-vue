//Vue.config.js
module.exports = {
    //For server, path of the project
    publicPath: process.env.NODE_ENV === 'production' ? '/bus/' : '/',
    devServer: {
        port: 8085,
        open: true,
        https: false,
        host: 'localhost',
        proxy: {
            '/api': {
                //default
                target: 'http://localhost:8090',
                //For server
                // target: 'http://47.105.33.143:8090',
                changeOrigin: true,
                pathRewrite: {
                    '^/api': ''
                }
            }
        }
    }
}