import { createHistory } from '@reach/router';
import createHashSource from 'hash-source';

const source = createHashSource();
export const history = createHistory(source);
export const navigate = history.navigate;
