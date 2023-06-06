import type { Plugin } from 'vite';
export interface PoneglyphPluginOptions {
    entry: {
        server: string;
        client: string;
    };
}
export default function poneglyphPlugin(options: PoneglyphPluginOptions): Plugin[];
