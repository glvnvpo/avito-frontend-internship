import React from 'react';
import {mount} from 'enzyme';
import {Spinner} from '../spinner';

describe('Spinner', () => {
	let wrapper;

	it('should render default Spinner', () => {
		wrapper = mount(<Spinner/>);
		expect(wrapper).toMatchSnapshot();
	});
});