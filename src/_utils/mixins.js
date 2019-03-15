/* Clearfix */
export const cf = () => `
    &:after {
        content: "";
        display: table;
        clear: both;
    }
`;

/* Font size REM */
const baseFontSize = 15;
export const fz = size => `
    font-size: ${parseFloat(size / baseFontSize).toPrecision(7)}rem;
`;

/* Font family */
export const ff = name => `
    font-family: ${name}, Arial, sans-serif;
`;

export const textGlitch = () => `
    .safari & {
        font-weight: 400;
        transform-style: preserve-3d;
        backface-visibility: hidden;
    }
`;

export const mq = size => `@media (min-width: ${size})`;

export const mqMax = size => `@media (max-width: ${size})`;

export const mqWidthHeight = (width, height) => `@media (min-width: ${width}) and (min-height: ${height})`;

export const mqWidthMaxHeight = (width, height) => `@media (min-width: ${width}) and (max-height: ${height})`;

export const retina = () => `@media only screen and (-webkit-min-device-pixel-ratio: 1.5),
    only screen and (min-device-pixel-ratio: 1.5),
    only screen and (min-resolution: 192dpi),
    only screen and (min-resolution: 2dppx)`;

export const retinaMin = size => `@media only screen and (-webkit-min-device-pixel-ratio: 1.5) and (min-width: ${size}),
    only screen and (min-device-pixel-ratio: 1.5) and (min-width: ${size}),
    only screen and (min-resolution: 192dpi) and (min-width: ${size}),
    only screen and (min-resolution: 2dppx) and (min-width: ${size})`;

export const print = () => '@media only print';
