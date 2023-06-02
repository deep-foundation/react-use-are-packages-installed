import { createRequire } from 'module';
import { jest } from '@jest/globals';
const require = createRequire(import.meta.url);
require('dotenv').config();

beforeAll(() => {
   Object.defineProperty(window, 'localStorage', {
     value: {
       getItem: jest.fn(),
       setItem: jest.fn(),
       removeItem: jest.fn(),
       clear: jest.fn(),
     },
     writable: true,
   });
 });
 
jest.setTimeout(120000);
// Please move slowest tests to bottom to make progress bar more dynamic and get more tests done first.
import './tests/main';
