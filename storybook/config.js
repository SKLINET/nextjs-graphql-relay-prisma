import { configure } from '@storybook/react';
import backgrounds from '@storybook/addon-backgrounds';
import { addDecorator } from '@storybook/react';
import '_utils/global-styles';

const req = require.context('../src/components', true, /\.stories\.js$/);

function loadStories() {
    req.keys().forEach(filename => req(filename));
}

addDecorator(
    backgrounds([
        { name: 'white', value: '#FFF', default: true },
        { name: 'black', value: '#000' },
        { name: 'facebook', value: '#3b5998' },
        { name: 'red', value: '#f00' },
    ])
);

configure(loadStories, module);
