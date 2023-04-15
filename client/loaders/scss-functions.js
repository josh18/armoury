export default function (source) {
    return `
        @function alphaLight($value) {
            @return hsl(0 0% 100% / $1);
        }

        ${source}
    `;
}
