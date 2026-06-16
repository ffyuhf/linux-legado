import { watch } from 'vue';
import 'element-plus/theme-chalk/el-loading.css';
import './loading.css';
export declare const useLoading: (target: watch<string | HTMLElement | undefined>, text: string, spinner?: any) => {
    isLoading: any;
    showLoading: () => boolean;
    closeLoading: () => boolean;
    loadingWrapper: (promise: Promise<unknown>) => Promise<unknown>;
};
