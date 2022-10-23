// @flow

import React, {FC, useEffect, useState, MouseEvent} from 'react';
import {useLocation} from 'react-router-dom';
import {Button} from 'antd';
import axios from 'axios';
import {isEmpty, isNull} from 'lodash';
import './styles.scss';
import {ID, Story} from '../../types';
import {StoryCard} from '../../components/StoryCard';
import {Spinner} from '../../components/Spinner';
import {setStories} from '../../store/stories';
import {MINUTE} from '../../constants/time';
import {ITEM, NEW_STORIES} from '../../api/constants';
import {useAppDispatch, useAppSelector} from '../../hooks/redux';
import {MAIN_PAGE_PATH} from '../../routing/constants';

const STORIES_NUMBER = 100;

export const Main: FC = () => {

	let stories = useAppSelector(state => state.stories.value);

	const dispatch = useAppDispatch();
	
	const [isLoading, setLoading] = useState<boolean>(stories.length <= 0);
	
	let location = useLocation();
	
	let timer: NodeJS.Timeout | undefined;

	useEffect(() => {
		loadStoriesEachMinute();
		return () => clearTimeout(timer);
	}, [location?.pathname]);

	const loadStoriesEachMinute = () => {
		loadNewStories();

		timer = setTimeout(loadStoriesEachMinute, MINUTE);
	};

	const loadNewStories = (event?: MouseEvent) => {

		if (event) {
			setLoading(true);
		}

		axios<ID[]>(NEW_STORIES())
			.then(async ({data}) => {
				const newestStories = [...data.slice(0, STORIES_NUMBER)];
				let loadedStories: Story[] = [];
				const promises = newestStories.map(loadOneStory);

				await Promise.allSettled(promises)
					.then(data => 
						loadedStories = data
							.filter(({status}) => status === 'fulfilled')
							// @ts-ignore
							.map(({value}) => value)
					)
					.finally(() => {
						dispatch(setStories(loadedStories));
						setLoading(false);
					});
			})
			.catch(() => setLoading(false));
	};

	const loadOneStory = (id: ID) => {
		return new Promise((resolve, reject) => {
			axios<Story>(ITEM(id))
				.then(({data}) => !isNull(data) ? resolve(data) : reject())
				.catch(err => reject(err));
		});
	};

	return (
		<div className='main'>
			<div className='content'>
				<div className='header bg-white'>
					<span className='title bold color-grey2'>Latest news</span>
					<Button onClick={(e) => loadNewStories(e)} type='primary'>Update news</Button>
				</div>

				<div className='cards mt-10'>
					{ isLoading ? <Spinner className='mt-20'/> :
						(!isEmpty(stories)) ? stories.map((story: Story) =>
							<StoryCard
								story={story}
								key={story.id}
								asLink
								to={`${MAIN_PAGE_PATH}/${story.id}`}
							/>
						) : <span className='empty mt-20 bold color-dark-grey'>No stories found :(</span>
					}
				</div>
			</div>
		</div>
	);
};