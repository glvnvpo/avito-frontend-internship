import React from 'react';
import {mount} from 'enzyme';
import {BrowserRouter} from 'react-router-dom';
import {Fields, StoryCard} from '../story-card';
import {Story} from '../../../types';

const mockUseNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
	...jest.requireActual('react-router-dom'),
	useNavigate: () => mockUseNavigate
}));

type Props = {
	story: Story | undefined;
	isLoading?: boolean;
	asLink?: boolean;
	to?: string;
	extraFieldsToShow?: Array<Fields>;
}

describe('StoryCard', () => {
	let wrapper;

	const renderComponent = ({story, ...rest}: Props) =>
		mount(<BrowserRouter>
			<StoryCard story={story} {...rest}/>
		</BrowserRouter>);


	const story = {
		id: 11,
		title: 'someTitle',
		by: 'coolUser',
		time: 1666689031,
		score: 3,
		url: 'https://reactjs.org/',
		descendants: 10
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('should render correct story card', () => {
		wrapper = renderComponent({story: story});
		expect(wrapper).toMatchSnapshot();
	});

	it('should call useNavigate hook', () => {
		wrapper = renderComponent({story: story, asLink: true, to:'/somePath'});
		wrapper.find('.story>.link').simulate('click');
		expect(mockUseNavigate).toHaveBeenCalled();
	});

	it('should not call useNavigate hook when path is not defined', () => {
		wrapper = renderComponent({story: story, asLink: true});
		wrapper.find('.story>.link').simulate('click');
		expect(mockUseNavigate).not.toHaveBeenCalled();
	});

	it('should render extra field', () => {
		wrapper = renderComponent({story: story, extraFieldsToShow: [Fields.COMMENTS_COUNT]});
		expect(wrapper.find('.url')).toHaveLength(0);
		expect(wrapper.find('.comments-count')).toHaveLength(1);
	});

	it('should render error when url is undefined', () => {
		const newStory = {
			...story,
			url: undefined
		};
		wrapper = renderComponent({story: newStory, extraFieldsToShow: [Fields.URL]});
		expect(wrapper.find('.url').text()).toBe('No source link available');
	});

	it('should render when story is undefined', () => {
		wrapper = renderComponent({story: undefined});
		expect(wrapper.text()).toBe('Some troubles in loading story');
	});
});