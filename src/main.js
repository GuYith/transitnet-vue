import Vue from 'vue';
import App from './App.vue';
import BaiduMap from 'vue-baidu-map';
import HelloWorld from "@/components/HelloWorld";
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css'
import axios from "axios";
import $ from 'jquery';
import MapVisual from "@/components/MapVisual";
import router from "./router/index.js";
/**
 * Set the reverse proxy, the front-end request sent to the http://localhost:8090/api by default
 * @type {{CancelTokenSource: CancelTokenSource, Axios: Axios, CancelStatic: CancelStatic, HeadersDefaults: HeadersDefaults, AxiosDefaults: AxiosDefaults, AxiosProxyConfig: AxiosProxyConfig, AxiosResponseTransformer: AxiosResponseTransformer, AxiosStatic: AxiosStatic, AxiosRequestConfig: AxiosRequestConfig, AxiosRequestTransformer: AxiosRequestTransformer, AxiosRequestHeaders: AxiosRequestHeaders, Cancel: Cancel, AxiosInstance: AxiosInstance, AxiosError: AxiosError, Method: Method, AxiosPromise: AxiosPromise, CancelTokenStatic: CancelTokenStatic, AxiosBasicCredentials: AxiosBasicCredentials, ResponseType: ResponseType, CancelToken: CancelToken, AxiosInterceptorManager: AxiosInterceptorManager, TransitionalOptions: TransitionalOptions, Canceler: Canceler, AxiosResponse: AxiosResponse, AxiosResponseHeaders: AxiosResponseHeaders, AxiosAdapter: AxiosAdapter} | AxiosStatic}
 */
axios.default.baseURL = "http://localhost:8090/api";
/**
 * Other components send data via this.$axios
 * @type {AxiosStatic|{CancelTokenSource: CancelTokenSource, Axios: Axios, CancelStatic: CancelStatic, HeadersDefaults: HeadersDefaults, AxiosDefaults: AxiosDefaults, AxiosProxyConfig: AxiosProxyConfig, AxiosResponseTransformer: AxiosResponseTransformer, AxiosStatic: AxiosStatic, AxiosRequestConfig: AxiosRequestConfig, AxiosRequestTransformer: AxiosRequestTransformer, AxiosRequestHeaders: AxiosRequestHeaders, Cancel: Cancel, AxiosInstance: AxiosInstance, AxiosError: AxiosError, Method: Method, AxiosPromise: AxiosPromise, CancelTokenStatic: CancelTokenStatic, AxiosBasicCredentials: AxiosBasicCredentials, ResponseType: ResponseType, CancelToken: CancelToken, AxiosInterceptorManager: AxiosInterceptorManager, TransitionalOptions: TransitionalOptions, Canceler: Canceler, AxiosResponse: AxiosResponse, AxiosResponseHeaders: AxiosResponseHeaders, AxiosAdapter: AxiosAdapter}|AxiosStatic}
 */
window.jQuery = $;
window.$ = $;
Vue.prototype.$axios = axios;
// axios.defaults.baseURL = 'http://47.105.33.143:8090/api';
axios.defaults.baseURL = 'http://localhost:8090/api';
Vue.config.productionTip = false;
Vue.use(BaiduMap, {
  /* Visit http://lbsyun.baidu.com/apiconsole/key for details about app key. */
  ak: 'wS6oFNUtxQkjV7NsMd5iyNn2ydw2XlmE'
});
Vue.use(router)
Vue.use(ElementUI);
new Vue({
  render: h => h(App),
  router
}).$mount('#app');


