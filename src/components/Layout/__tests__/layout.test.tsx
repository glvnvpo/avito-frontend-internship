import React from 'react';
import {mount} from 'enzyme';
import {Layout} from '../layout';

describe('Layout', () => {
	let wrapper;

	it('should render correct layout', () => {
		wrapper = mount(<Layout/>);
		expect(wrapper).toMatchSnapshot();
	});
});