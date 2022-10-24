// @flow

import React, {FC, HTMLAttributes} from 'react';
import {useNavigate} from 'react-router-dom';
import {Card} from 'antd';
import './styles.scss';
import {Story} from '../../types';
import {getDateFromTimestamp} from '../../helpers/get-date-from-timestamp';

export enum Fields {
    ALL= 'all',
    URL = 'url',
    COMMENTS_COUNT = 'comments-count',
	SCORE = 'score'
}

type Props = {
    story?: Story;
    isLoading?: boolean;
    asLink?: boolean;
    to?: string;
	extraFieldsToShow?: Array<Fields>;
}

export const StoryCard: FC<Props & HTMLAttributes<any>> = ({story, isLoading=false, asLink=false,
	to, extraFieldsToShow=[Fields.ALL], ...rest}) => {
    
	let {title, score, by, time, url, descendants} = story || {};

	const navigate = useNavigate();

	const shouldShowExtraField = (key: Fields): boolean => {
		if (extraFieldsToShow.includes(Fields.ALL)) {
			return true;
		}

		return extraFieldsToShow.includes(key);
	};
	
	const navigateTo = (path: string | undefined): void => {
		if (path) {
			navigate(path);
		}
	};

	return (
		<Card title={title} className={`story color-grey3 ${asLink && 'link'}`}
			  onClick={() => navigateTo(to)} {...rest}>
			<span>
				{ shouldShowExtraField(Fields.SCORE) && <>{score}&nbsp;point{(score && score>1) &&'s'}&nbsp;| </> }
				<span className='user'>{by}</span>&nbsp;| {getDateFromTimestamp(time)}</span>

			{
				shouldShowExtraField(Fields.URL) &&
				<span>{url ? <a href={url} target='_blank' rel='noreferrer'>Visit source</a> : 'No source link available'}</span>
			}

			{
				shouldShowExtraField(Fields.COMMENTS_COUNT) &&
				<span>Comments count: {descendants}</span>
			}
		</Card>

	);
};