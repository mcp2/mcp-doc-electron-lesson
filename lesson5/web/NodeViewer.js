import React from 'react';
import PropTypes from 'prop-types';

import {Div} from 'react-treebeard/dist/components/common';
import styles from './styles';

const HELP_MSG = '内容显示在此处........';

const NodeViewer = ({node}) => {
    const style = styles.viewer;
    let json = JSON.stringify(node, null, 4);

    if (!json) {
        json = HELP_MSG;
    }

    return <Div style={style.base}>{json}</Div>;
};

export default NodeViewer;
