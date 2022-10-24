// @flow

import React, {FC, ReactNode} from 'react';
import {Comment} from 'antd';
import parse from 'html-react-parser';
import './styles.scss';
import {Comment as CommentType} from '../../types';
import {getDateFromTimestamp} from '../../helpers/get-date-from-timestamp';

type Props = {
	comment: CommentType;
	isParent?: boolean;
	showAnswers?: () => void;
	children?: ReactNode;
}

export const CommentCard: FC<Props> = ({comment, isParent=true, showAnswers, children, ...rest}) => {

	let {by, time, text, kids, isLoadingChildren, showChildComment} = comment || {};

	return (
		<Comment className='comment-card' author={by} content={parse(text)} datetime={getDateFromTimestamp(time)}>
			{children}
		</Comment>
	);
};