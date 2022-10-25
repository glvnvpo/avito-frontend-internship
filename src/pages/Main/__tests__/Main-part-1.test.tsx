import React from 'react';
import {mount, ReactWrapper} from 'enzyme';
import axios from 'axios';
import {Provider} from 'react-redux';
import {BrowserRouter} from 'react-router-dom';
import {act} from 'react-dom/test-utils';
import {createStore} from '@reduxjs/toolkit';
import {Main} from '../Main';
import {NEW_STORIES as mockNEW_STORIES} from '../../../api/constants';

// Тесты для страницы Main разделены на несколько файлов т.к. act()
// падает с ошибкой при вызове ее несколько раз в одном файле

jest.mock('axios', () => ({
	__esModule: true,
	...jest.requireActual('axios'),
	default: jest.fn((url) => {
		if (url === mockNEW_STORIES()) {
			return Promise.resolve({data: [10]});
		} else return Promise.resolve({
			data: {
				id: 10,
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

describe('Main Part 1', () => {

	let wrapper: ReactWrapper<any, React.Component['state'], React.Component> | undefined;

	const waitForComponentToPaint = async () => {
		await act(async () => {
			await new Promise(resolve => setTimeout(resolve, 0));
		});
	};

	let initValue = [{
		id: 20,
		title: 'someTitle',
		by: 'coolUser',
		time: 1666689031,
		score: 4,
		url: 'https://reactjs.org/',
		descendants: 10
	}];
	
	const getWrapper = (initStore = initValue) => {
		const store = createStore(() => ({
			stories: {
				value: initStore
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
	
	it('should render Main page with StoryCard', () => {
		wrapper = getWrapper();
		expect(wrapper).toMatchSnapshot();
	});
	
	it('should render Main page with Spinner', () => {
		wrapper = getWrapper([]);
		waitForComponentToPaint();
		expect(wrapper).toMatchSnapshot();
	});
});