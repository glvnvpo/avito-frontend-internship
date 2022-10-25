// @flow

import React, {FC, HTMLAttributes} from 'react';
import {useNavigate} from 'react-router-dom';
import {Card} from 'antd';
import {isEmpty} from 'lodash';
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
    story: Story | undefined;
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
		<Card className={`story color-grey3 ${asLink && 'link'}`}
			  onClick={() => navigateTo(to)} {...rest} loading={isLoading}>

			{
				!isEmpty(story) ? 
					<>
						<span className='title color-orange bold mb-10'>{title}</span>
						<span>
							{ shouldShowExtraField(Fields.SCORE) && <>{score}&nbsp;point{(score && score>1) &&'s'}&nbsp;| </> }
							<span className='user bold'>{by}</span>&nbsp;| {getDateFromTimestamp(time)}</span>

						{
							shouldShowExtraField(Fields.URL) &&
							<span className='url'>{url ? <a href={url} target='_blank' rel='noreferrer'>Visit source</a> : 'No source link available'}</span>
						}

						{
							shouldShowExtraField(Fields.COMMENTS_COUNT) &&
							<span className='comments-count'>Comments count: {descendants}</span>
						}
					</>
					: <span className='error bold'>Some troubles in loading story</span>
			}
		</Card>

	);
};