declare const _default: {
    base: {
        name: string;
        children: ({
            title: string;
            id: string;
            type: string;
            array: string[];
            required: boolean;
            hint?: undefined;
        } | {
            title: string;
            id: string;
            type: string;
            hint: string;
            required: boolean;
            array?: undefined;
        } | {
            title: string;
            id: string;
            type: string;
            hint: string;
            array?: undefined;
            required?: undefined;
        })[];
    };
    search: {
        name: string;
        children: ({
            title: string;
            id: string;
            type: string;
            hint: string;
            namespace?: undefined;
        } | {
            title: string;
            namespace: string;
            id: string;
            type: string;
            hint: string;
        })[];
    };
    find: {
        name: string;
        children: ({
            title: string;
            id: string;
            type: string;
            hint: string;
            namespace?: undefined;
        } | {
            title: string;
            namespace: string;
            id: string;
            type: string;
            hint: string;
        })[];
    };
    detail: {
        name: string;
        children: {
            title: string;
            namespace: string;
            id: string;
            type: string;
            hint: string;
        }[];
    };
    directory: {
        name: string;
        children: {
            title: string;
            namespace: string;
            id: string;
            type: string;
            hint: string;
        }[];
    };
    content: {
        name: string;
        children: {
            title: string;
            namespace: string;
            id: string;
            type: string;
            hint: string;
        }[];
    };
    other: {
        name: string;
        children: {
            title: string;
            id: string;
            type: string;
        }[];
    };
};
export default _default;
