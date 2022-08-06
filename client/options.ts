import { resolve } from 'path';

const root = process.cwd();

export interface ClientOptions {
    replacementVariables?: Record<string, any>;
    start?: {
        staticPaths?: string[];
        port?: number;
    };
    build?: {
        analyze?: boolean;
        appPath?: string;
    }
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
