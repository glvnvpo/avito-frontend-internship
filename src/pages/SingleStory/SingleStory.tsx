// @flow

import React, {FC, MouseEvent, useEffect, useState} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {isEmpty, isNull} from 'lodash';
import {Button} from 'antd';
import axios from 'axios';
import './styles.scss';
import {Story, Comment, ID, ChildComment} from '../../types';
import {MINUTE} from '../../constants/time';
import {ITEM} from '../../api/constants';
import {MAIN_PAGE_PATH} from '../../routing/constants';
import {StoryCard, Fields} from '../../components/StoryCard';
import {Spinner} from '../../components/Spinner';

export const SingleStory: FC = () => {

	const {id: idStory} = useParams<string>();
	const id = Number(idStory);

	const [story, setStory] = useState<Story>();
	const [comments, setComments] = useState<Comment[]>([]);
	const [childrenComments, setChildrenComments] = useState({});
	const [isStoryLoading, setStoryLoading] = useState<boolean>(true);
	const [isCommentsLoading, setCommentsLoading] = useState<boolean>(true);

	const navigate = useNavigate();
	let location = useLocation();

	let timer: NodeJS.Timeout | undefined;

	const extraFieldsToShow = [Fields.URL, Fields.COMMENTS_COUNT];

	useEffect(() => {
		updateStoryAndCommentsEachMinute(id);
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
				<StoryCard isLoading={isStoryLoading} story={story} extraFieldsToShow={extraFieldsToShow} />

				{
					!isEmpty(story) &&
					<Button onClick={(e) => updateStoryAndComments(id, e)} type='primary'>Update comments</Button>
				}

				<div className='comments mt-20 mb-20'>

					{ (!isEmpty(story) && !isCommentsLoading) &&
						(!isEmpty(comments) ? <span className='color-dark-grey bold'>Comments:</span>
							: <span className='color-grey bold'>No comments found</span>)
					}

					{ (isCommentsLoading && !isStoryLoading) ? <Spinner className='mt-20' /> :
						!isEmpty(comments) && comments.map((comment: Comment) =>
							<div className='comment-wrapper mt-20' key={comment.id}>
								{comment.text}
							</div>
						)}
				</div>
			</div>
		</div>
	);
};