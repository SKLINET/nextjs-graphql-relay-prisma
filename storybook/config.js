import { configure } from '@storybook/react';
import { withBackgrounds } from '@storybook/addon-backgrounds';
import { addDecorator } from '@storybook/react';
import '../src/_utils/global-styles';

const req = require.context('../src/components', true, /\.stories\.tsx$/);

function loadStories() {
    req.keys().forEach(filename => req(filename));
}

addDecorator(
    withBackgrounds([
        { name: 'white', value: '#FFF', default: true },
        { name: 'black', value: '#000' },
        { name: 'facebook', value: '#3b5998' },
        { name: 'red', value: '#f00' },
    ])
);

configure(loadStories, module);
