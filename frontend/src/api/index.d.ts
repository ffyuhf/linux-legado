import API from './api';
/**
 * 按照阅读的默认规则 解析阅读HTTP WebSocket API入口地址
 * @returns [http_url, webSocekt_url]
 */
export declare const parseLeagdoHttpUrlWithDefault: (http_url: string | URL) => [string, string];
export default API;
export * from './api';
