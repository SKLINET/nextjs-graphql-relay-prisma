import React from 'react';
import PropTypes from 'prop-types';
import Logo from '../static/svg/logo.svg';

const renderIcon = name => {
    let el = null;
    switch (name.toLowerCase()) {
        case 'logo':
            el = <Logo />;
            break;
        default:
            el = <div />;
            break;
    }
    return el;
};

renderIcon.propTypes = {
    name: PropTypes.string.isRequired,
};

export default renderIcon;
