// @flow

import React, {FC} from 'react';
import {Story} from '../../types';

enum Fields {
    ALL= 'all',
    URL = 'url',
    DESCENDANTS = 'descendants',
    TEXT = 'text'
}

type Props = {
    story: Story;
    isLoading?: boolean;
    asLink?: boolean;
    to?: string;
    fieldsToShow?: Array<Fields>;
}

export const StoryCard: FC<Props> = ({story, isLoading=false, asLink=false, 
	to, fieldsToShow=[Fields.ALL], ...rest}) => {
    
	let {title, score, by, time, url, text, descendants} = story;

	const shouldShowField = (key: Fields): boolean => {
		if (fieldsToShow.includes(Fields.ALL)) {
			return true;
		}

		return fieldsToShow.includes(key);
	};

	return (
		<div className='story'>
			{title}
		</div>
	);
};