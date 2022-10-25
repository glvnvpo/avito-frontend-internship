// @flow

import React, {FC, ReactNode} from 'react';
import {Button, Comment} from 'antd';
import {isEmpty} from 'lodash';
import parse from 'html-react-parser';
import './styles.scss';
import {Colors, Sizes, Spinner} from '../Spinner';
import {Comment as CommentType} from '../../types';
import {getDateFromTimestamp} from '../../helpers/get-date-from-timestamp';

type Props = {
	comment: CommentType;
	isParent?: boolean;
	showAnswers?: (parentComment: CommentType) => void;
	children?: ReactNode;
}

export const CommentCard: FC<Props> = ({comment, isParent=true, showAnswers, children, ...rest}) => {

	let {by, time, text, kids, isLoadingChildren, showChildComment} = comment || {};

	const getBtnText = (isOpen: boolean | undefined):string => {
		if (isOpen) {
			return 'Hide answers';
		}
		else return 'Show answers';
	};

	const actions = [
		(isParent && !isEmpty(kids) && showAnswers) &&
		<Button onClick={() => showAnswers(comment)}>
			{ isLoadingChildren ? <Spinner size={Sizes.SMALL} color={Colors.BLUE}/> : getBtnText(showChildComment) }
		</Button>
	];

	return (
		<Comment
			className='comment-card'
			author={by}
			content={text && parse(text)}
			datetime={getDateFromTimestamp(time)}
			actions={actions}
			{...rest}
		>
			{children}
		</Comment>
	);
};