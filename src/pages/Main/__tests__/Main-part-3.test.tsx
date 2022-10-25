import React from 'react';
import {mount, ReactWrapper} from 'enzyme';
import {Provider} from 'react-redux';
import {BrowserRouter} from 'react-router-dom';
import {act} from 'react-dom/test-utils';
import axios from 'axios';
import {createStore} from '@reduxjs/toolkit';
import {Main} from '../Main';
import {NEW_STORIES as mockNEW_STORIES} from '../../../api/constants';

// Тесты для страницы Main разделены на несколько файлов т.к. waitForComponentToPaint()
// падает с ошибкой при вызове ее несколько раз в одном файле

jest.mock('axios', () => ({
	__esModule: true,
	...jest.requireActual('axios'),
	default: jest.fn((url) => {
		if (url === mockNEW_STORIES()) {
			return Promise.resolve({data: [11]});
		} else return Promise.resolve({
			data: {
				id: 11,
				title: 'someTitle',
				by: 'coolUser',
				time: 1666689031,
				score: 3,
				url: 'https://reactjs.org/',
				descendants: 10
			}
		});
	})
}));

describe('Main Part 3', () => {

	let wrapper: ReactWrapper<any, React.Component['state'], React.Component> | undefined;

	const waitForComponentToPaint = async () => {
		await act(async () => {
			await new Promise(resolve => setTimeout(resolve, 0));
		});
	};
	
	const getWrapper = () => {
		const store = createStore(() => ({
			stories: {
				value: []
			}
		}));

		return mount(<Provider store={store}>
			<BrowserRouter>
				<Main/>
			</BrowserRouter>
		</Provider>);
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('should call axios', () => {
		wrapper = getWrapper();
		waitForComponentToPaint();
		wrapper.find('.header>Button').simulate('click');
		expect(axios).toHaveBeenCalled();
	});
});