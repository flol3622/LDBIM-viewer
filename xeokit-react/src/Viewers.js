/* eslint-disable import/order */
import { makeViewer } from './Viewer';
import { GLTFLoaderPlugin } from '@xeokit/xeokit-sdk';
import { XKTLoaderPlugin } from '@xeokit/xeokit-sdk';

export const GLTFViewer = makeViewer(GLTFLoaderPlugin);
export const XKTViewer = makeViewer(XKTLoaderPlugin);
