import React from 'react';
import {mount} from 'enzyme';
import {CommentCard} from '../comment-card';
import {Comment} from '../../../types';

describe('CommentCard', () => {
	let wrapper;

	const comment = {
		id: 123,
		by: 'coolUser',
		text: 'someText',
		time: 1666689031,
		kids: [124],
		showChildComment: true
	};
	const childComment = {
		id: 124,
		by: 'coolUser124',
		text: 'someText124',
		time: 1666689031,
		parent: 123
	};
	const showAnswers = jest.fn();
	
	const getComponent = (parentComment: Comment) => {
		return mount(
			<CommentCard comment={parentComment} showAnswers={showAnswers}>
				<CommentCard comment={childComment} isParent={false}/>
			</CommentCard>);
	};
	
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('should render correct comment tree (opened)', () => {
		wrapper = getComponent(comment);
		expect(wrapper).toMatchSnapshot();
	});

	it('should render correct button text when comment tree is closed', () => {
		const parentComment = {
			...comment,
			showChildComment: false
		};
		wrapper = getComponent(parentComment);
		expect(wrapper.find('.ant-btn').text()).toBe('Show answers');
	});
	
	it('should call showAnswers with parent comment', () => {
		wrapper = getComponent(comment);
		wrapper.find('.ant-btn').simulate('click');
		expect(showAnswers).toHaveBeenCalledWith(comment);
	});

	it('should render spinner when loading children comments', () => {
		const parentComment = {
			...comment,
			showChildComment: false,
			isLoadingChildren: true
		};
		wrapper = getComponent(parentComment);
		expect(wrapper.find('Spinner')).toHaveLength(1);
	});

	it('should return correct text when comment is deleted', () => {
		const parentComment = {
			...comment,
			deleted: true
		};
		wrapper = getComponent(parentComment);
		expect(wrapper.find('Comment').at(0).prop('content')).toBe('This comment was deleted');
	});

	it('should return correct text when comment is dead', () => {
		const parentComment = {
			...comment,
			dead: true
		};
		wrapper = getComponent(parentComment);
		expect(wrapper.find('Comment').at(0).prop('content')).toBe('Comment not available');
	});
});
