import { resolve } from 'path';

const root = process.cwd();

export interface ClientOptions {
    analyze?: boolean;
    publicPath?: string;
    environmentVariables?: Record<string, unknown>;
    devServer?: {
        staticPaths?: string[];
        port?: number;
    };
}

export async function loadOptions(): Promise<ClientOptions> {
    try {
        const { options } = await import(resolve(root, './.armoury.ts'));

        return options;
    } catch {
        return {};
    }
}

export const paths = {
    dist: resolve(root, './dist'),
    public: resolve(root, './public'),
    src: resolve(root, './src'),
    tsconfig: resolve(root, './tsconfig.json'),
};
