// @flow

import React, {FC} from 'react';
import {Outlet} from 'react-router-dom';
import {PageHeader} from 'antd';
import './styles.scss';

export const Layout: FC = () => {
	return (
		<>
			<PageHeader
				className='layout bg-orange'
				title='HACKER NEWS'
			/>
			<Outlet/>
		</>
	);
};