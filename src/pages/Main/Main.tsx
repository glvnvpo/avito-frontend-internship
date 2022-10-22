// @flow

import React, {FC, useEffect, useState, MouseEvent} from 'react';
import {useLocation} from 'react-router-dom';
import {Button} from 'antd';
import axios from 'axios';
import {isNull} from 'lodash';
import {ID, Story} from '../../types';
import {setStories} from '../../store/stories';
import {MINUTE} from '../../constants/time';
import {ITEM, NEW_STORIES} from '../../api/constants';
import {useAppDispatch, useAppSelector} from '../../hooks/redux';

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
			.catch((err) => console.error(err));
	};

	const loadOneStory = (id: ID) => {
		return new Promise((resolve, reject)=> {
			axios(ITEM(id))
				.then(({data}) => !isNull(data) ? resolve(data) : reject())
				.catch(err => reject(err));
		});
	};

	return (
		<div className='main'>
			<div className='content'>
				<div className='header bg-white'>
					<h4 className='color-grey2'>Latest news</h4>
					<Button onClick={(e) => loadNewStories(e)} type='primary'>Update news</Button>
				</div>

			</div>
		</div>
	);
};