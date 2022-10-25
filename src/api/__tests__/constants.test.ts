import {ITEM, NEW_STORIES} from '../constants';

describe('API', () => {

	it('should return correct url for new stories', () => {
		const expected = 'https://hacker-news.firebaseio.com/v0/newstories.json';
		expect(NEW_STORIES()).toBe(expected);
	});

	it('should return correct url for new item', () => {
		const id = '123';
		const expected = `https://hacker-news.firebaseio.com/v0/item/${id}.json`;
		expect(ITEM(id)).toBe(expected);
	});
});