// import polyfills
import 'core-js/stable';
import 'regenerator-runtime/runtime';

import React from 'react';
import ReactDOM from 'react-dom';

import { App } from './components';

import './styles/index.scss';

ReactDOM.render(<App />, document.getElementById('root'));
