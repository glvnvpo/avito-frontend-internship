// @flow

import React, {FC} from 'react';
import {Outlet} from 'react-router-dom';

export const Layout: FC = () => {
	return (
		<>
			<div className='layout'>
				<h2>HACKER NEWS</h2>
			</div>
			<Outlet/>
		</>
	);
};