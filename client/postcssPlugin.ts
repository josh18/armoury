export const postcssPlugin = () => {
    return {
        postcssPlugin: 'armoury',
        Declaration(decl: { value: string }) {
            if (decl.value.includes('alphaLight')) {
                decl.value = decl.value.replace(
                    /alphaLight\(([\d.]*)\)/,
                    'hsl(0 0% 100% / $1)',
                );
            } else if (decl.value.includes('alphaDark')) {
                decl.value = decl.value.replace(
                    /alphaDark\(([\d.]*)\)/,
                    'hsl(0 0% 0% / $1)',
                );
            }
        },
    };
};

postcssPlugin.postcss = true;
