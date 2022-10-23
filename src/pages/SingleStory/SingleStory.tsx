// @flow

import React, {FC, MouseEvent, useEffect, useState} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {isEmpty, isNull} from 'lodash';
import {Button} from 'antd';
import axios from 'axios';
import {Story, Comment, ID, ChildComment} from '../../types';
import {MINUTE} from '../../constants/time';
import {ITEM} from '../../api/constants';
import {MAIN_PAGE_PATH} from '../../routing/constants';
import {StoryCard} from '../../components/StoryCard';

export const SingleStory: FC = () => {

	const {id} = useParams<string>();
	const idStory = Number(id);


	const [story, setStory] = useState<Story>();
	const [comments, setComments] = useState<Comment[]>([]);
	const [childrenComments, setChildrenComments] = useState({});
	const [isStoryLoading, setStoryLoading] = useState<boolean>(true);
	const [isCommentsLoading, setCommentsLoading] = useState<boolean>(true);

	const navigate = useNavigate();
	let location = useLocation();

	let timer: NodeJS.Timeout | undefined;

	useEffect(() => {
		updateStoryAndCommentsEachMinute(idStory);
		return () => clearTimeout(timer);
	}, [location?.pathname]);

	const updateStoryAndCommentsEachMinute = (id: ID) => {
		updateStoryAndComments(id);
		timer = setTimeout(() => updateStoryAndCommentsEachMinute(id), MINUTE);
	};

	const updateStoryAndComments = (id: ID, event?: MouseEvent) => {
		if (event) {
			setCommentsLoading(true);
		}

		loadStory(id)
			.then((data) => loadComments(data))
			.catch(() => setCommentsLoading(false));
	};

	const loadStory = (id: ID): Promise<Story> => {
		return new Promise((resolve, reject) => {
			axios<Story>(ITEM(id))
				.then(({data}) => {
					if (data) {
						setStory(data);
						resolve(data);
					}
					else {
						setStory(undefined);
						reject('No data');
					}
				})
				.catch((err) => reject(err))
				.finally(() => setStoryLoading(false));
		});
	};

	const loadOneComment = (id: ID): Promise<Comment | ChildComment> => {
		return new Promise((resolve, reject) => {
			axios<Comment | ChildComment>(ITEM(id))
				.then(({data}) => !isNull(data) ? resolve(data) : reject('No data'))
				.catch(err => reject(err));
		});
	};

	const loadComments = ({kids}: Story) => {
		if (kids && !isEmpty(kids)) {
			const promises = kids.map(loadOneComment);

			Promise.allSettled(promises)
				.then(data => {
					const loadedComments = data
						.filter(({status}) => status === 'fulfilled')
						// @ts-ignore
						.map(({value}) => value);

					setComments(prevComments => {
						if (!isEmpty(prevComments)) {
							return loadedComments.map(comment => {
								const existingComment = prevComments.find(el => el.id === comment.id);
								return {
									...comment,
									showChildComment: existingComment ? existingComment.showChildComment : false
								};
							});
						}
						else return loadedComments;
					});
				})
			
				.finally(() => setCommentsLoading(false));
		}
		else {
			setCommentsLoading(false);
		}
	};

	const goBackToStories = () => {
		navigate(MAIN_PAGE_PATH);
	};

	return (
		<div className='single-story'>
			<div className='content'>
				<Button onClick={() => goBackToStories()} type='primary' className='mt-20 mb-10'>Go back to news</Button>
				{story?.title}
				<StoryCard isLoading={isStoryLoading} story={story} />
			</div>
		</div>
	);
};