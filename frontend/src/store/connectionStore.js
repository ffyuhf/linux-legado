import { defineStore } from 'pinia';
export const useConnectionStore = defineStore('connection', {
    state: () => {
        return {
            connectStatus: '正在连接后端服务器……',
            connectType: 'primary',
            newConnect: false,
        };
    },
    actions: {
        setConnectStatus(connectStatus) {
            if (this.newConnect === true)
                return;
            this.connectStatus = connectStatus;
        },
        setConnectType(connectType) {
            if (this.newConnect === true)
                return;
            this.connectType = connectType;
        },
        setNewConnect(newConnect) {
            this.newConnect = newConnect;
        },
    },
});
