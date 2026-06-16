export declare const isNullOrBlank: (string: string | null | undefined | number) => boolean;
export declare const isLegadoUrl: (/** @type {string} */ url: string) => boolean;
/**
 * 验证输入的URL是否符合阅读后端地址规则
 * @param allowedProtocols 允许的协议，默认`["https:", "http:"]`
 */
export declare const validatorHttpUrl: (http_url: string | URL, allowedProtocols?: string[]) => boolean;
export declare const dateFormat: (/** @type {number} */ t: number) => string;
/**
 * 懒加载正则
 */
export declare const lazyRegex: (pattern: string, flags?: string) => () => RegExp;
