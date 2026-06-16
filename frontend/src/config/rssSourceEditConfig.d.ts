declare const _default: {
    base: {
        name: string;
        children: ({
            title: string;
            id: string;
            type: string;
            hint: string;
            required: boolean;
        } | {
            title: string;
            id: string;
            type: string;
            hint: string;
            required?: undefined;
        })[];
    };
    start: {
        name: string;
        children: {
            title: string;
            id: string;
            type: string;
            hint: string;
        }[];
    };
    list: {
        name: string;
        children: {
            title: string;
            id: string;
            type: string;
            hint: string;
        }[];
    };
    webView: {
        name: string;
        children: {
            title: string;
            id: string;
            type: string;
            hint: string;
        }[];
    };
    other: {
        name: string;
        children: ({
            title: string;
            id: string;
            type: string;
            array: string[];
        } | {
            title: string;
            id: string;
            type: string;
            array?: undefined;
        })[];
    };
};
export default _default;
