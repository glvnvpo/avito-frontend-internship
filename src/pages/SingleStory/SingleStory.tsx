// @flow

import React, {FC, MouseEvent, useEffect, useState} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {isEmpty, isNull} from 'lodash';
import {Button} from 'antd';
import axios from 'axios';
import './styles.scss';
import {Story, Comment, ID} from '../../types';
import {MINUTE} from '../../constants/time';
import {ITEM} from '../../api/constants';
import {MAIN_PAGE_PATH} from '../../routing/constants';
import {StoryCard, Fields} from '../../components/StoryCard';
import {Spinner} from '../../components/Spinner';
import {CommentCard} from '../../components/CommentCard';

type childrenCommentsToSave = {
	[key: ID]: Comment
}

export const SingleStory: FC = () => {


	const {id: idStory} = useParams<string>();
	const id = Number(idStory);

	const [story, setStory] = useState<Story>();
	const [comments, setComments] = useState<Comment[]>([]);
	const [childrenComments, setChildrenComments] = useState<childrenCommentsToSave>({});
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

	const loadOneComment = (id: ID): Promise<Comment> => {
		return new Promise((resolve, reject) => {
			axios<Comment>(ITEM(id))
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
								const showChildComment = existingComment ? existingComment.showChildComment : false;

								const newComment = {
									...comment,
									showChildComment: showChildComment
								};

								if (showChildComment) {
									showChildrenComments(newComment, true);
								}

								return newComment;
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

	const changeVisibilityOfChildComment = (parentId: ID) => {
		setComments(prevComments => {
			const parentComment = prevComments.find(({id}) => parentId === id);
			const newVisibility = !parentComment?.showChildComment;
			return prevComments.map(
				comment => (comment.id === parentId && parentComment) ?
					{...parentComment, showChildComment: newVisibility}
					: comment
			);
		});
	};

	const changeParentCommentLoadingChildren = (parentId: ID) => {
		setComments(prevComments => {
			const parentComment = prevComments.find(({id}) => parentId === id);
			return prevComments.map(
				comment => ( comment.id === parentId && parentComment) ?
					{
						...parentComment,
						isLoadingChildren: !parentComment.isLoadingChildren
					}
					: comment
			);
		});
	};

	const loadChildrenComments = (parentComment: Comment) => {
		const {kids} = parentComment;

		return new Promise<void>(resolve => {
			if (kids) {
				const promises = kids.map(loadOneComment);
				Promise.allSettled(promises)
					.then(data => {
						data
							.filter(({status}) => status === 'fulfilled')
							// @ts-ignore
							.forEach(({value}) => {
								setChildrenComments(prevChildrenComments => (
									{
										...prevChildrenComments,
										[value.id]: value
									}
								));

								if (value.kids) {
									resolve(loadChildrenComments(value));
								} else resolve();
							});
					});
			}
		});
	};

	const renderChildComment = (comment: Comment) =>
 		<CommentCard
			key={comment.id}
			comment={comment}
			isParent={false}>
			{comment.kids && renderChildrenComments(comment.kids)}
		</CommentCard>;

	const renderChildrenComments = (kids: Array<ID>) => {
		return <>
			{kids && kids.map(kid => {
				return childrenComments[kid] && renderChildComment(childrenComments[kid]);
			})}
		</>;
	};

	const showChildrenComments = (parentComment: Comment, stayOpenChildrenComments: boolean = false) => {

		const {id, showChildComment} = parentComment;

		if (stayOpenChildrenComments && showChildComment) {
			changeParentCommentLoadingChildren(id);
			loadChildrenComments(parentComment)
				.finally(() => {
					changeParentCommentLoadingChildren(id);
				});
		}
		else if (showChildComment) {
			changeVisibilityOfChildComment(id);
		}
		else {
			changeParentCommentLoadingChildren(id);
			loadChildrenComments(parentComment)
				.finally(() => {
					changeParentCommentLoadingChildren(id);
					changeVisibilityOfChildComment(id);
				});
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
							<div className='comment-wrapper' key={comment.id}>
								<CommentCard
									comment={comment}
									showAnswers={showChildrenComments}>
									{ (comment.kids && comment.showChildComment) && renderChildrenComments(comment.kids) }
								</CommentCard>
							</div>
						)}
				</div>
			</div>
		</div>
	);
};