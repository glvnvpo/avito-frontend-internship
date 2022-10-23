// @flow

import React, {FC, HTMLAttributes} from 'react';
import {useNavigate} from 'react-router-dom';
import {Card} from 'antd';
import './styles.scss';
import {Story} from '../../types';
import {getDateFromTimestamp} from '../../helpers/get-date-from-timestamp';

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

export const StoryCard: FC<Props & HTMLAttributes<any>> = ({story, isLoading=false, asLink=false,
	to, fieldsToShow=[Fields.ALL], ...rest}) => {
    
	let {title, score, by, time, url, text, descendants} = story;

	const navigate = useNavigate();

	const shouldShowField = (key: Fields): boolean => {
		if (fieldsToShow.includes(Fields.ALL)) {
			return true;
		}

		return fieldsToShow.includes(key);
	};
	
	const navigateTo = (path: string | undefined): void => {
		if (path) {
			navigate(path);
		}
	};

	return (
		<Card title={title} className={`story color-grey3 ${asLink && 'link'}`}
			  onClick={() => navigateTo(to)} {...rest}>
			{score} points | <span className='user'>{by}</span> | {getDateFromTimestamp(time)}
		</Card>

	);
};