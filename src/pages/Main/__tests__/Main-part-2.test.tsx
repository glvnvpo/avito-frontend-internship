import React from 'react';
import {mount, ReactWrapper} from 'enzyme';
import axios from 'axios';
import {Provider} from 'react-redux';
import {BrowserRouter} from 'react-router-dom';
import {createStore} from '@reduxjs/toolkit';
import {isNull} from 'lodash';
import {Main} from '../Main';
import {Story} from '../../../types';
import {NEW_STORIES as mockNEW_STORIES} from '../../../api/constants';
import {setStories} from '../../../store/stories';
import {waitForComponentToPaint} from '../../../jest/helpers/wait-for-component-to-paint';

// Тесты для страницы Main разделены на несколько файлов т.к. act()
// падает с ошибкой при вызове несколько раз в одном файле

let mockLoadNewStories = Promise.resolve({data: [10]});
let mockLoadOneStory: Promise<{ data: Story | null }> = Promise.resolve({
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

jest.mock('axios', () => ({
	__esModule: true,
	...jest.requireActual('axios'),
	default: jest.fn((url) => {
		if (url === mockNEW_STORIES()) {
			return mockLoadNewStories;
		} else return mockLoadOneStory;
	})
}));

jest.mock('lodash', () => ({
	...jest.requireActual('lodash'),
	isNull: jest.fn((value) => value === null)
}));

jest.mock('../../../store/stories', () => ({
	...jest.requireActual('../../../store/stories'),
	setStories: jest.fn()
}));

let initValue = [{
	id: 20,
	title: 'someTitle',
	by: 'coolUser',
	time: 1666689031,
	score: 4,
	url: 'https://reactjs.org/',
	descendants: 10
}];

const store = createStore(() => ({
	stories: {
		value: initValue
	}
}));

describe('Main Part 2', () => {

	let wrapper: ReactWrapper<any, React.Component['state'], React.Component> | undefined;

	beforeEach(() => {
		jest.clearAllMocks();
	});
	
	const getWrapper = () =>
		mount(<Provider store={store}>
			<BrowserRouter>
				<Main/>
			</BrowserRouter>
		</Provider>);

	it('should call isNull with null', async () => {
		mockLoadOneStory = Promise.resolve({
			data: null
		});
		wrapper = getWrapper();
		await waitForComponentToPaint();
		// @ts-ignore
		expect(isNull.mock.calls[0][0]).toBeNull();
	});

	it('should call setStories with empty array', async () => {
		mockLoadOneStory = Promise.reject('Something went wrong');
		wrapper = getWrapper();
		await waitForComponentToPaint();
		// @ts-ignore
		expect(setStories.mock.calls[0][0]).toEqual([]);
	});
});